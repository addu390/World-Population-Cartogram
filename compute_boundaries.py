from shapely.geometry import Polygon as shpPolygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
import pandas as pd
from geojson import Feature, Polygon, MultiPolygon, FeatureCollection


def create_polygon(row):
    return shpPolygon([(row['X'], row['Y']),
                       (row['X'] + 1, row['Y']),
                       (row['X'] + 1, row['Y'] + 1),
                       (row['X'], row['Y'] + 1)])


def df_to_tuple(border_df):
    border = tuple((zip(border_df.X / 1000, border_df.Y / 1000)))
    return border


# for both squares and squares+triangles
for tilingStyle in ['squares']:
    tilingPath = 'cells.csv'

    # load in cellsDF
    cellsDF = pd.read_csv(tilingPath)

    # get full set of country codes
    countryCodeList = pd.unique(cellsDF['CountryCode'])

    # -#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
    #   prepare to iterate country by country   #
    # -#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#-#
    featureList = []
    polygonID = 0
    bordersDF = pd.DataFrame()
    for countryCode in countryCodeList:

        # select just the relevant country cells
        countryCellsDF = cellsDF.loc[cellsDF['CountryCode'] == countryCode]

        # create a dataframe of this country's polygons
        countryPolyDF = countryCellsDF.apply(create_polygon, axis=1)

        # now combine all squares into a single (multi-) Polygon
        unionPolygon = unary_union(countryPolyDF.tolist())

        # Now we need to handle "Polygon" vs "Multipolygon" differently
        if unionPolygon.geom_type == 'Polygon':
            # -#-#-#-#-#-#-#
            #   Polygon   #
            # -#-#-#-#-#-#-#
            unionPolygon = orient(unionPolygon, -1)
            polygonID = polygonID + 1

            # Populate DF with data
            borderDF = pd.DataFrame(unionPolygon.exterior.coords[:], columns=["X", "Y"])
            borderDF['PolygonID'] = polygonID
            borderDF['CountryCode'] = countryCode
            borderDF['BorderType'] = "Exterior"

            # initiate JSON object
            polygonBorders = []

            # populate JSON with data
            myBorder = df_to_tuple(borderDF)
            polygonBorders.append(myBorder)

            # if there's a hole on the inside of our polygon - add that
            if len(unionPolygon.interiors) > 0:
                for intpoly in unionPolygon.interiors:
                    polygonID = polygonID + 1
                    intborderDF = pd.DataFrame(intpoly.coords[:], columns=["X", "Y"])
                    intborderDF['PolygonID'] = polygonID
                    intborderDF['CountryCode'] = countryCode
                    intborderDF['BorderType'] = "Interior"
                    borderDF = pd.concat([borderDF, intborderDF])
                    #
                    myInnerBorder = df_to_tuple(intborderDF)
                    polygonBorders.append(myInnerBorder)

            # finalize DF and JSON before leaving loop
            newBorderDF = borderDF
            myP = Polygon(polygonBorders)
            myF = Feature(geometry=myP, properties={"id": str(countryCode) + '--' + str(polygonID)})

        else:
            # -#-#-#-#-#-#-#-#-#
            #   MultiPolygon  #
            # -#-#-#-#-#-#-#-#-#
            allborderDF = pd.DataFrame()
            multiPolygons = []  # initiate JSON object (MultiPolygon)

            for geom in unionPolygon.geoms:
                geom = orient(geom, -1)
                polygonID = polygonID + 1
                borderDF = pd.DataFrame(geom.exterior.coords[:], columns=["X", "Y"])
                borderDF['PolygonID'] = polygonID
                borderDF['CountryCode'] = countryCode
                borderDF['BorderType'] = "Exterior"

                # initiate JSON object (Polygon)
                polygonBorders = []

                # populate JSON with data
                myBorder = df_to_tuple(borderDF)
                polygonBorders.append(myBorder)

                if len(geom.interiors) > 0:
                    for intpoly in geom.interiors:
                        polygonID = polygonID + 1
                        intborderDF = pd.DataFrame(intpoly.coords[:], columns=["X", "Y"])
                        intborderDF['PolygonID'] = polygonID
                        intborderDF['CountryCode'] = countryCode
                        intborderDF['BorderType'] = "Interior"
                        borderDF = pd.concat([borderDF, intborderDF])
                        #
                        myInnerBorder = df_to_tuple(intborderDF)
                        polygonBorders.append(myInnerBorder)
                allborderDF = pd.concat([allborderDF, borderDF])
                multiPolygons.append(polygonBorders)

            # finalize DF and JSON before leaving loop
            newBorderDF = allborderDF
            myMP = MultiPolygon(multiPolygons)
            myF = Feature(geometry=myMP, properties={"id": str(countryCode) + '--' + str(polygonID)})

        # add this new country's dataframe onto the aggregate dataframe
        bordersDF = pd.concat([bordersDF, newBorderDF])
        featureList.append(myF)

    # now write everything to file for each tiling
    # First, the "borders.csv"
    bordersDF.to_csv('borders.csv', index=False)
    # Next, the "geo.json"
    feature_collection = FeatureCollection(featureList)
