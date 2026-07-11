import os
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import json

load_dotenv()

# We need to define the output schema
class CRMRecord(BaseModel):
    created_at: Optional[str] = Field(description="Lead creation date. Must be valid JS date")
    name: Optional[str] = Field(description="Lead name")
    email: Optional[str] = Field(description="Primary email")
    country_code: Optional[str] = Field(description="Country code")
    mobile_without_country_code: Optional[str] = Field(description="Mobile number")
    company: Optional[str] = Field(description="Company name")
    city: Optional[str] = Field(description="City")
    state: Optional[str] = Field(description="State")
    country: Optional[str] = Field(description="Country")
    lead_owner: Optional[str] = Field(description="Lead owner")
    crm_status: Optional[str] = Field(description="Lead status. Only use one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE")
    crm_note: Optional[str] = Field(description="Notes/remarks, follow-up notes, additional emails/mobile numbers")
    data_source: Optional[str] = Field(description="Source. Only use one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Leave blank if unsure.")
    possession_time: Optional[str] = Field(description="Property possession time")
    description: Optional[str] = Field(description="Additional description")

class BatchCRMRecords(BaseModel):
    records: List[CRMRecord] = Field(description="List of extracted CRM records")

# Prompt
prompt_template = """
You are an intelligent data extraction AI for a CRM system.
I am providing you with a batch of raw records extracted from a CSV file. The columns may have arbitrary names, and there may be messy data.
Map these fields to our CRM format.

Rules:
1. CRM Status Values: Only use GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE.
2. Data Source Values: Only use leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Leave blank if unsure.
3. Multiple emails: Use first email as primary, append others to crm_note.
4. Multiple mobiles: Use first mobile as primary, append others to crm_note.
5. Skip invalid records: If a record contains NEITHER email NOR mobile number, you should still return it but it will be filtered out by the system later (or you can omit it). Actually, always return all records that match the input count if possible, but it's okay to omit completely invalid ones.
6. The created_at field MUST be convertible using JavaScript new Date(created_at).

Raw Records:
{raw_records}
"""

def extract_crm_data(batch: List[dict]):
    # Setup LLM
    llm = ChatOpenAI(
        model="gpt-4o",
        api_key=os.getenv("OPENROUTER_API_KEY"),
        base_url="https://openrouter.ai/api/v1",
        max_tokens=2000,
        model_kwargs={
            "extra_headers": {
                "HTTP-Referer": "http://localhost",
                "X-Title": "GrowEasy CRM"
            }
        }
    )
    
    structured_llm = llm.with_structured_output(BatchCRMRecords)
    
    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["raw_records"]
    )
    
    chain = prompt | structured_llm
    
    from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def invoke_with_retry():
        return chain.invoke({"raw_records": json.dumps(batch)})
        
    try:
        response = invoke_with_retry()
    except Exception as e:
        print(f"Failed to process batch after retries: {e}")
        # Let the exception bubble up to views.py to send to the frontend
        raise Exception(f"AI Extraction failed: {str(e)}")
    
    extracted_records = response.records
    
    parsed = []
    skipped = []
    
    for r in extracted_records:
        r_dict = r.dict()
        # Rule 7: Skip Invalid Records (no email AND no mobile)
        if not r_dict.get('email') and not r_dict.get('mobile_without_country_code'):
            skipped.append(r_dict)
        else:
            parsed.append(r_dict)
            
    return parsed, skipped
