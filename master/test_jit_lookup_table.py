import galois

GF2 = galois.GF(2)
f_poly = galois.Poly([1, 0, 0, 1, 1], field=GF2)
p_poly = galois.Poly([1, 0, 0, 0, 0], field=GF2)
_, p_inv_poly, _ = galois.egcd(p_poly, f_poly)
print(p_inv_poly)
# q = f_poly // p_poly
# print(q)
