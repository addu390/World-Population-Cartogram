import csv

cells = []

with open('grid.asc', 'r') as f:
    x = [[int(num) for num in line.split()] for line in f]
    for i in range(len(x)):
        for j in range(len(x[i])):
            if x[i][j] != 32767:
                cells.append([j, i, x[i][j]])

with open("cells.csv", "w+") as my_csv:
    csvWriter = csv.writer(my_csv, delimiter=',')
    csvWriter.writerows(cells)
