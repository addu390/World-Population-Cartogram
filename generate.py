import csv
import numpy as np
from shapely.geometry import Polygon as shpPolygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
import pandas as pd
from geojson import Feature, Polygon, MultiPolygon


def generate_cells():
    cells = []

    with open('grid.asc', 'r') as f:
        x = [[int(num) for num in line.split()] for line in f]
        for i in range(len(x)):
            for j in range(len(x[i])):
                if x[i][j] != 32767:
                    cells.append([j, i, x[i][j]])

    cells = np.array(sorted(cells, key=lambda a_entry: a_entry[2]))
    with open("cells.csv", "w+") as csv_file:
        csv_writer = csv.writer(csv_file, delimiter=',')
        csv_writer.writerow(['X', 'Y', 'CountryCode'])
        csv_writer.writerows(cells)


def create_polygon(row):
    return shpPolygon([(row['X'], row['Y']),
                       (row['X'] + 1, row['Y']),
                       (row['X'] + 1, row['Y'] + 1),
                       (row['X'], row['Y'] + 1)])


def df_to_tuple(border_df):
    border = tuple((zip(border_df.X / 1000, border_df.Y / 1000)))
    return border


def generate_borders():

    cells_df = pd.read_csv('cells.csv')
    country_code_list = pd.unique(cells_df['CountryCode'])

    feature_list = []
    polygon_id = 0
    borders_df = pd.DataFrame()

    for countryCode in country_code_list:
        country_cells_df = cells_df.loc[cells_df['CountryCode'] == countryCode]
        country_poly_df = country_cells_df.apply(create_polygon, axis=1)
        union_polygon = unary_union(country_poly_df.tolist())

        if union_polygon.geom_type == 'Polygon':
            # -#-#-#-#-#-#-#
            #   Polygon   #
            # -#-#-#-#-#-#-#
            union_polygon = orient(union_polygon, -1)
            polygon_id = polygon_id + 1

            border_df = pd.DataFrame(union_polygon.exterior.coords[:], columns=["X", "Y"])
            border_df['PolygonID'] = polygon_id
            border_df['CountryCode'] = countryCode
            border_df['BorderType'] = "Exterior"

            polygon_borders = []

            each_border = df_to_tuple(border_df)
            polygon_borders.append(each_border)

            if len(union_polygon.interiors) > 0:
                for int_poly in union_polygon.interiors:
                    polygon_id = polygon_id + 1
                    int_border_df = pd.DataFrame(int_poly.coords[:], columns=["X", "Y"])
                    int_border_df['PolygonID'] = polygon_id
                    int_border_df['CountryCode'] = countryCode
                    int_border_df['BorderType'] = "Interior"
                    border_df = pd.concat([border_df, int_border_df])
                    inner_border = df_to_tuple(int_border_df)
                    polygon_borders.append(inner_border)

            new_border_df = border_df
            new_polygon = Polygon(polygon_borders)
            new_feature = Feature(geometry=new_polygon, properties={"id": str(countryCode) + '--' + str(polygon_id)})

        else:
            # -#-#-#-#-#-#-#-#-#
            #   MultiPolygon  #
            # -#-#-#-#-#-#-#-#-#
            all_border_df = pd.DataFrame()
            multi_polygons = []

            for geom in union_polygon.geoms:
                geom = orient(geom, -1)
                polygon_id = polygon_id + 1
                border_df = pd.DataFrame(geom.exterior.coords[:], columns=["X", "Y"])
                border_df['PolygonID'] = polygon_id
                border_df['CountryCode'] = countryCode
                border_df['BorderType'] = "Exterior"

                polygon_borders = []

                each_border = df_to_tuple(border_df)
                polygon_borders.append(each_border)

                if len(geom.interiors) > 0:
                    for int_poly in geom.interiors:
                        polygon_id = polygon_id + 1
                        int_border_df = pd.DataFrame(int_poly.coords[:], columns=["X", "Y"])
                        int_border_df['PolygonID'] = polygon_id
                        int_border_df['CountryCode'] = countryCode
                        int_border_df['BorderType'] = "Interior"
                        border_df = pd.concat([border_df, int_border_df])
                        inner_border = df_to_tuple(int_border_df)
                        polygon_borders.append(inner_border)
                all_border_df = pd.concat([all_border_df, border_df])
                multi_polygons.append(polygon_borders)

            new_border_df = all_border_df
            multi_polygon = MultiPolygon(multi_polygons)
            new_feature = Feature(geometry=multi_polygon, properties={"id": str(countryCode) + '--' + str(polygon_id)})

        # add this new country's dataframe onto the aggregate dataframe
        borders_df = pd.concat([borders_df, new_border_df])
        feature_list.append(new_feature)

    borders_df.to_csv('borders.csv', index=False)


if __name__ == "__main__":
    generate_cells()
    generate_borders()