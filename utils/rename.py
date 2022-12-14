# read the csv file data.csv and replace column minutes data to from 'PT*H*M' or 'PT*M' or 'PT*H' to integer in minutes
# write the new data to a new csv file data_new.csv

import csv
import re

with open('raw_data/data.csv', 'r') as csvinput:
    with open('raw_data/data_new.csv', 'w') as csvoutput:
        writer = csv.writer(csvoutput, lineterminator='\n')
        reader = csv.reader(csvinput)

        for row in reader:
            if row[4] == 'minutes':  # skip the header row
                writer.writerow(row)
                continue
            minutes = row[4]
            # make regex to find if 'PT*H*M' 'PT*M' or 'PT*H' is in the string
            if re.search('PT.*H.*M', minutes):
                # if 'PT*H*M' is in the string, remove 'PT' and 'H' and 'M', convert to integer and multiply by 60
                minutes = int(minutes.replace('PT', '').replace(
                    'H', '').replace('M', '')) * 60
            elif re.search('PT.*M', minutes):
                # if 'PT*M' is in the string, remove 'PT' and 'M' and convert to integer
                minutes = int(minutes.replace('PT', '').replace('M', ''))
            elif re.search('PT.*H', minutes):
                # if 'PT*H' is in the string, remove 'PT' and 'H', convert to integer and multiply by 60
                minutes = int(minutes.replace('PT', '').replace('H', '')) * 60
            else:
                # if no match, set minutes to 0
                minutes = 0
            # replace the old minutes value with the new minutes value
            row[4] = minutes
            # remove redundant time in date_submitted column
            row[3] = row[3].split('T')[0]
            # write the new row to the new csv file
            writer.writerow(row)
