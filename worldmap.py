import numpy as np
import pandas as pd
from matplotlib.collections import PatchCollection
import matplotlib
import matplotlib.pyplot as plt

borders = pd.read_csv("borders.csv")
cells = pd.read_csv("cells.csv")

fig = plt.figure()
ax = fig.add_subplot(111, aspect='equal')
plt.xlim([0, max(cells["X"] + 1)])
plt.ylim([0, max(cells["Y"] + 1)])
n = cells.shape[0]
patches = []

for i in range(0, n):
    patches.append(matplotlib.patches.Rectangle((cells.loc[i, "X"] + .5, cells.loc[i, "Y"] + .5), 1, 1, color="#008000"))
ax.add_collection(PatchCollection(patches, alpha=0.1))

for p in np.unique(borders["PolygonID"]):
    ax.plot(borders.loc[borders["PolygonID"] == p, "X"], borders.loc[borders["PolygonID"] == p, "Y"])
plt.show()
