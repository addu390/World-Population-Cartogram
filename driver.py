from generate import generate_cells, generate_borders, generate_matrix
from worldmap import plot


def main():
    generate_cells('grid.asc', 'cells.csv')
    generate_borders('cells.csv', 'borders.csv')
    plot('cells.csv', 'borders.csv')


def matrix():
    generate_matrix('grid.asc', 'matrix.csv')


if __name__ == "__main__":
    print("Our World in Data")
