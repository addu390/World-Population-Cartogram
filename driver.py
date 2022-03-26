from generate import generate_cells, generate_borders
from worldmap import plot


def main():
    generate_cells('grid.asc', 'cells.csv')
    generate_borders('cells.csv', 'borders.csv')
    plot('cells.csv', 'borders.csv')


if __name__ == "__main__":
    main()
