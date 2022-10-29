## Problem definition 
You have directories containing data files and specification files. The specification files describe 
the structure of the data files. Write an application in the language of your choice that reads 
format definitions from specification files. Use these definitions to convert the parsed files to 
NDJSON files. 

## Problem details 
Data files exist in a data/ directory relative to your application and specification files exist in a 
specs/ directory relative to your application. 
  
Specification files will have filenames equal to the file type they specify and extension of .csv. So 
fileformat1.csv would be the specification for files of type fileformat1. 
  
Data files will have filenames based on their specification file name, followed by an underscore, 
followed by the drop date and an extension of .txt. For example fileformat1_20202-10-15.txt 
would be a file that arrived on 10/15/2020 and should be parsed using specs/fileformat1.csv. 
  
Format files will be csv formatted with columns "column name", "width", and "datatype". 
• "column name" will be the name of the keys in the JSON object 
• "width" is the number of characters taken up by the column in the data file 
• "datatype" is the JSON data type that should be present in the resulting JSON object. 
Data files will be flat text files with lines formatted as specified by their associated specification 
file. 

You should output the parsed files into an NDJSON format with 1 JSON object for each line of 
the input file.  The output file name should be the same as the input file name before the extension 
and inside the output/ directory. 

## Example

This is an example file pair; other files may vary in structure while still fitting the structure of the 
problem details (above): 
specs/testformat1.csv: 
1"column name",width,datatype 
2name,10,TEXT 
3valid,1,BOOLEAN 
4count,3,INTEGER 
  
Here we have a specification that describes 3 columns: 
• The first 10 characters labeled "name" of type TEXT 
• The next 1 character labeled "valid" of type BOOLEAN ('1' = True, '0' = False) 
• The last 3 characters labeled "count" of type INTEGER 
data/testformat1_2021-07-06.txt: 
1Diabetes  1  1 
2Asthma    0-14 
3Stroke    1122 
  
Processing this data file results in the following output file: 
output/testformat1_2021-07-06.ndjson: 
1{"name": "Diabetes", "valid": true, "count": 1} 
2{"name": "Asthma", "valid": false, "count": -14} 
3{"name": "Stroke", "valid": true, "count": 122}