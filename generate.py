import os
import csv
import numpy as np
from shapely.geometry import Polygon as shpPolygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
import pandas as pd
from geojson import Feature, Polygon, MultiPolygon, FeatureCollection, dump


def generate_pop():
    df_1 = pd.DataFrame(pd.read_csv("data/country-code.csv"))
    df_2 = pd.DataFrame(pd.read_csv("data/world-population-unpd.csv"))

    pd.to_numeric(df_2["future-population"])
    df_2["future-population"] = df_2["future-population"].fillna(0)

    pd.to_numeric(df_2["current-population"])
    df_2["current-population"] = df_2["current-population"].fillna(0)

    df_2["population"] = df_2["future-population"] + df_2["current-population"]
    df_2["population"] = df_2["population"].astype('int')

    df_2 = df_2.set_index(['name', 'code', 'year'])['population'].unstack()
    df_2 = df_2.filter(["name", "code", 1950, 2018, 2019, 2020, 2030])

    df_3 = pd.merge(df_2, df_1, on=['name', 'name'])
    df_3 = df_3.filter(["name", "code", 1950, 2018, 2019, 2020, 2030])

    df_3.to_csv('temp.csv')


def generate_matrix(grid_filename, matrix_filename):
    with open(grid_filename, 'r') as f:
        input_array = [[int(float(num)) for num in line.split()] for line in f]
        np_array = np.asarray(input_array)
        pd.DataFrame(np_array).to_csv(matrix_filename)


def generate_cells(grid_filename, cell_filename):
    cells = []

    with open(grid_filename, 'r') as f:
        x = [[int(float(num)) for num in line.split()] for line in f]
        for i in range(len(x)):
            for j in range(len(x[i])):
                if x[i][j] != 32767 and x[i][j] != -9999:
                    cells.append([j, i, x[i][j]])

    cells = np.array(sorted(cells, key=lambda a_entry: a_entry[2]))
    with open(cell_filename, "w+") as csv_file:
        csv_writer = csv.writer(csv_file, delimiter=',')
        csv_writer.writerow(['X', 'Y', 'CountryCode'])
        csv_writer.writerows(cells)


def generate_borders(cell_filename, border_filename):
    population_df = pd.read_csv('data/world-population-unpd-3.csv')
    cells_df = pd.read_csv(cell_filename)
    country_code_list = pd.unique(cells_df['CountryCode'])

    feature_list = []
    polygon_id = 0
    borders_df = pd.DataFrame()

    for countryCode in country_code_list:
        country_cells_df = cells_df.loc[cells_df['CountryCode'] == countryCode]
        country_poly_df = country_cells_df.apply(create_polygon, axis=1)
        union_polygon = unary_union(country_poly_df.tolist())

        if not population_df.loc[population_df['code'] == countryCode].empty:
            current = population_df.loc[population_df['code'] == countryCode].values[0][4]
        else:
            print(countryCode)

        if union_polygon.geom_type == 'Polygon':
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
            new_feature = Feature(geometry=new_polygon,
                                  properties={"id": str(countryCode),
                                              "polygon-id": str(countryCode) + '-' + str(polygon_id),
                                              "count": current})

        else:
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
            new_feature = Feature(geometry=multi_polygon,
                                  properties={"id": str(countryCode),
                                              "polygon-id": str(countryCode) + '-' + str(polygon_id),
                                              "count": current})

        borders_df = pd.concat([borders_df, new_border_df])
        feature_list.append(new_feature)

    borders_df.to_csv(border_filename, index=False)
    borders_df.to_csv(border_filename, index=False)
    feature_collection = FeatureCollection(feature_list)
    geo_path = 'data/test2/geo.json'

    with open(geo_path, 'w', encoding='utf8') as geojson_file:
        dump(feature_collection, geojson_file)

    projected_geo_path = 'data/test2/projected_geo.json'
    topo_path = 'data/test2/topo.json'
    os.system(
        "npx geoproject 'd3.geoNaturalEarth1().fitSize([1000, 500], d)' < " + geo_path + " > " + projected_geo_path)
    os.system("npx geo2topo tiles=" + projected_geo_path + " \
            | npx toposimplify -p 0.0005 \
            | npx topoquantize 1e9 > " + topo_path)


def create_polygon(row):
    return shpPolygon([(row['X'], row['Y']),
                       (row['X'] + 1, row['Y']),
                       (row['X'] + 1, row['Y'] + 1),
                       (row['X'], row['Y'] + 1)])


def df_to_tuple(border_df):
    border = tuple((zip(border_df.X / 1000, border_df.Y / 1000)))
    return border


if __name__ == "__main__":
    generate_pop()
    print("Our World in Data - Generator")