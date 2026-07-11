from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import pandas as pd
import json
from .ai_extractor import extract_crm_data

@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_csv(request):
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=400)
    
    try:
        # Read CSV with pandas
        df = pd.read_csv(file_obj)
        # Convert to list of dicts, fill nan with None
        df = df.where(pd.notnull(df), None)
        records = df.to_dict('records')
        
        # We can extract using Langchain in batches to avoid context limit
        BATCH_SIZE = 10
        all_successfully_parsed = []
        all_skipped = []
        
        for i in range(0, len(records), BATCH_SIZE):
            batch = records[i:i + BATCH_SIZE]
            parsed, skipped = extract_crm_data(batch)
            all_successfully_parsed.extend(parsed)
            all_skipped.extend(skipped)
            
        return Response({
            'total_imported': len(all_successfully_parsed),
            'total_skipped': len(all_skipped),
            'successfully_parsed': all_successfully_parsed,
            'skipped': all_skipped
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)
