import csv
import numpy as np

cells = []

with open('grid.asc', 'r') as f:
    x = [[int(num) for num in line.split()] for line in f]
    for i in range(len(x)):
        for j in range(len(x[i])):
            if x[i][j] != 32767:
                cells.append([j, i, x[i][j]])

cells = np.array(sorted(cells, key=lambda a_entry: a_entry[2]))
with open("cells.csv", "w+") as my_csv:
    csvWriter = csv.writer(my_csv, delimiter=',')
    csvWriter.writerows(cells)
