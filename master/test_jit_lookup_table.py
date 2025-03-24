import galois

GF = galois.GF(3, 5)
print(GF.ufunc_mode)
a = GF.Random(10_000_000, seed=1, dtype=int)
b = GF.Random(10_000_000, seed=2, dtype=int)
c = a * b
