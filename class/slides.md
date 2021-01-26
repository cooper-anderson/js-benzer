---

title: js-benzer
author: Cooper b. Anderson
date: 2021-01-25
styles:
  author:
    fg: '#87afff'
  slides:
    fg: '#f2c68a'
  title:
    fg: '#95e454'
  headings:
    '1':
      prefix: '█ '
    '2':
      prefix: '███ '
    '3':
      prefix: '█████ '
    '4':
      prefix: '███████ '
    default:
      prefix: '█████████ '
  table:
    column_spacing: 1
    header_divider:  
  style: solarized-dark

---

# Introduction

> `js-benzer` by Cooper b. Anderson
>
> Presentation for `BMTH302`
>
> Source code on GitHub:
> [cooper-anderson/js-benzer](https://github.com/cooper-anderson/js-benzer/)

## Recap

- The original JavaBenzer is rather outdated
  - Lackluster UX design
    - Difficult to operate rows and columns
    - Some menu options perform the same tasks
  - Uses an old version of Java (pre 2003)
  - Some features do not work anymore

## Goals

- Recreate the algorithms used for these mathematical processes
- Provide a modern UI that works on all modern platforms
  - i.e. Web based interface `WIP`
- Provide a backend library that can be used independently
  - i.e. standalone `npm` package

# Preface

Brief overview of formats being used in this presentation

## Matrix format

I will be representing matrices with squares and dots instead of 1s and 0s

  |   | α | β | γ | δ | ε | θ |                 |   |   | α | β | γ | δ | ε | θ
--|---|---|---|---|---|---|---|-----------------|---|---|---|---|---|---|---|--
α |   | 0 | 0 | 1 | 1 | 1 | 1 |                 | α |   | · | · | ■ | ■ | ■ | ■
β |   | 0 | 0 | 1 | 0 | 1 | 0 |                 | β |   | · | · | ■ | · | ■ | ·
γ |   | 1 | 1 | 0 | 1 | 1 | 1 |   is equal to   | γ |   | ■ | ■ | · | ■ | ■ | ■
δ |   | 1 | 0 | 1 | 0 | 0 | 1 |                 | δ |   | ■ | · | ■ | · | · | ■
ε |   | 1 | 1 | 1 | 0 | 0 | 0 |                 | ε |   | ■ | ■ | ■ | · | · | ·
θ |   | 1 | 0 | 1 | 1 | 0 | 0 |                 | θ |   | ■ | · | ■ | ■ | · | ·

## Set format

Standard representation using braces, e.g.

> Clique `A` contains `{ α β ε }`

###### What are these slides using??

The amazing markdown-to-slides program
[d0c-s4vage/lookatme](https://github.com/d0c-s4vage/lookatme/)

# Bron-Kerbosch Algorithm

An algorithm for finding the maximal cliques of a given adjacency matrix

## Variables

- `R` nodes confirmed in current clique
- `P` nodes needed to be tested for the current clique
- `X` nodes confirmed to *not* be in the current clique

`P` is initialized with the set of all nodes, while `R` and `X` are empty sets

## Pseudo Code

```ruby
 1  algorithm BronKerbosch(R, P, X) is
 2  │   if P and X are both empty then
 3  │   │   # report R as a maximal clique
 4  │   for each vertex v in P do
 5  │   │   BronKerbosch(R ∪ {v}, P ∩ N(v), X ∩ N(v))
 6  │   │   P ← P \ {v}
 7  │   │   X ← X ∪ {v}
```

## Explanation

If `P` and `X` are both empty, then `R` is a maximal clique. Otherwise, loop
over each vertex that still needs testing. For each of those vertices, do the
following: recurse with (`v` added to `R`, the intersection of `P` and nodes
connected to `V`, the same but with `X` instead of `P`), remove `v` from `P`
and add it to `X`.

# Bron-Kerbosch Algorithm ‣ Example

  |   | α | β | γ | δ | ε | θ
--|---|---|---|---|---|---|--
α |   | · | · | ■ | ■ | ■ | ■
β |   | · | · | ■ | · | ■ | ·
γ |   | ■ | ■ | · | ■ | ■ | ■
δ |   | ■ | · | ■ | · | · | ■
ε |   | ■ | ■ | ■ | · | · | ·
θ |   | ■ | · | ■ | ■ | · | ·
  |

depth   | `R`         | `P`             | `X`       | found
:-------|:------------|:----------------|:----------|:-----------:
0 ┋     | `∅`         | `{α β γ δ ε θ}` | `∅`
1 ┠┐    | `{α}`       | `{γ δ ε θ}`     | `∅`
2 ┃├┐   | `{α γ}`     | `{δ ε θ}`       | `∅`
3 ┃│├┐  | `{α γ δ}`   | `{θ}`           | `∅`
4 ┃││└■ | `{α γ δ θ}` | `∅`             | `∅`       | `{α γ δ θ}`
3 ┃│├■  | `{α γ ε}`   | `∅`             | `∅`       | `{α γ ε}`
3 ┃│└□  | `{α γ θ}`   | `∅`             | `{δ}`
2 ┃├┐   | `{α δ}`     | `{θ}`           | `{γ}`
2 ┃│└□  | `{α δ θ}`   | `∅`             | `{γ}`
2 ┃├□   | `{α ε}`     | `∅`             | `{γ δ}`
2 ┃└□   | `{α θ}`     | `∅`             | `{γ δ ε}`
1 ┠┐    | `{β}`       | `{γ ε}`         | `∅`
2 ┃├┐   | `{β γ}`     | `{ε}`           | `∅`
2 ┃│└■  | `{β γ ε}`   | `∅`             | `∅`       | `{β γ ε}`
2 ┋└□   | `{β ε}`     | `∅`             | `{γ}`

# Bron-Kerbosch Algorithm ‣ Discussion

## Problems with the Algorithm

- Time complexity is less than ideal, coming in at `O(3^(n/3))`
  - But this does not take into account set duplication!
- The process on the previous page does get a little tedious...
  - However, it does follow a simple pattern so its not *that* bad

## Homework Problems

The first homework problem will be manually running this algorithm on a matrix
by hand. Right answers are obviously not enough, as you could just look at the
matrix's graph representation.

- One caveat, the list of labels for the matrix is missing `θ`

The second problem will be coming up with ways to improve this version of the
Brom-Kerbosh algorithm. A big hint is provided on the problem.

# Sources

## Backend and Mathematics

- Bron-Kerbosch Algorithm
  - https://en.wikipedia.org/wiki/Bron–Kerbosch_algorithm
  - https://mathworld.wolfram.com/Bron-KerboschAlgorithm.html
  - https://www.youtube.com/watch?v=132XR-RLNoY
  - https://iq.opengenus.org/bron-kerbosch-algorithm/
- JavaBenzer
  - https://www.maa.org/press/periodicals/loci/resources/java-benzer
  - http://bioquest.org/esteem/esteem_details.php?product_id=202

## Frontend and User Interface `WIP`

- https://tauri.studio/en/
- https://reactjs.org/

## Code Repository

- https://github.com/cooper-anderson/js-benzer

# End Slide

> Do you have any...

## Questions?
### Comments?
#### Concerns?

> Otherwise...

##### Thank you!

