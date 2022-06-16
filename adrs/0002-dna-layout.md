# DNA Structure, Layouts

We have variable length modules (grid units per grid type)

The DNA string is split at every 2nd occurrence of an `END` module

So that’s rows

Then we need to carve columns out

So we count grid units per grid type per level… If there are smaller denominations than simply the entire section of that grid type, then we wrap in `[]`, this is a column (see `columnify`).

We need columns for stretch interaction
