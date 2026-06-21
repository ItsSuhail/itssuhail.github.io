# Latticed: 3D Solid State & Crystal Visualizer

An interactive, high-performance 3D web visualizer designed for Class 12 NCERT, JEE, and materials science students to explore crystallographic systems, Bravais lattices, ionic compounds, defects, and semiconductor doping.

🚀 **Live Demo:** [Host it on GitHub Pages!](https://ItsSuhail.github.io/Latticed/)

---

## 🌟 Features

### 1. Crystal Lattices & Voids
*   **Unit Cells**: Interactive 3D models of **Simple Cubic (SC)**, **Body-Centered Cubic (BCC)**, **Face-Centered Cubic (FCC)**, and **Hexagonal Close Packed (HCP)** structures.
*   **Visual Modes**: Toggle between **Ball-and-Stick** (structural clarity) and **Space-Filling** (realistic packing density and touching spheres) views.
*   **Lattice Clipping**: Toggle unit cell fraction clipping to view the exact contribution of each atom within the cell boundaries (e.g., $1/8$ at corners, $1/2$ at faces).
*   **Interactive Voids**: Highlight **Tetrahedral** and **Octahedral** voids dynamically inside FCC unit cells, showing their relative sizes and coordinate positions.

### 2. The 7 Crystal Systems & Bravais Lattices
Explore all 14 Bravais lattices by combining different crystal systems with variations:
*   **Systems**: Cubic, Tetragonal, Orthorhombic, Hexagonal, Rhombohedral, Monoclinic, and Triclinic.
*   **Variations**: Primitive (P), Body-Centered (I), Face-Centered (F), and End-Centered (C) where crystallographically allowed.
*   **Dynamic Angles & Axes**: Watch the unit cell boundaries skew and stretch in real-time as you switch systems.

### 3. Ionic & Covalent Compounds (NCERT Examples)
*   **Rock Salt ($\text{NaCl}$)**: $\text{Cl}^-$ forming FCC lattice, $\text{Na}^+$ occupying all octahedral voids ($6:6$ coordination).
*   **Cesium Chloride ($\text{CsCl}$)**: Simple cubic $\text{Cl}^-$ with $\text{Cs}^+$ at the body center ($8:8$ coordination).
*   **Zinc Blende ($\text{ZnS}$)**: $\text{S}^{2-}$ in FCC, $\text{Zn}^{2+}$ in alternate tetrahedral voids ($4:4$ coordination).
*   **Fluorite ($\text{CaF}_2$)**: $\text{Ca}^{2+}$ in FCC, $\text{F}^-$ in all tetrahedral voids ($8:4$ coordination).
*   **Diamond**: Carbon network forming FCC + alternate tetrahedral voids ($4$ coordination).

### 4. Interactive defects & Doping
*   **Schottky Defect ($\text{NaCl}$)**: Stoichiometric vacancy defect showing equal numbers of cation and anion vacancies (red wireframes). The cell rank $Z$ drops from $4.0$ to $3.0$ (density drops by $25\%$).
*   **Frenkel Defect ($\text{AgCl}$)**: Dislocation defect showing a silver cation ($\text{Ag}^+$) dislocated from its octahedral center to an interstitial tetrahedral void. Cation rank and density remain unchanged.
*   **n-type Semiconductor**: Diamond covalent lattice doped with Phosphorus (Group 15), featuring a delocalized conduction electron in an animated orbit.
*   **p-type Semiconductor**: Diamond covalent lattice doped with Boron (Group 13), featuring a pulsing violet electron hole.

### 5. Custom Miller Index Slicing Plane
*   Enter any Miller indices $(h, k, l)$ in custom inputs.
*   Uses a general intercepts-edge intersection algorithm to dynamically solve plane boundaries, sorting vertices in counterclockwise order and rendering a semi-transparent cyan plane slicing through the unit cell.

### 6. NCERT Density Calculator
Solve numerical problems dynamically:
$$d = \frac{Z \times M}{N_A \times a^3}$$
Select any compound or defect to automatically pre-fill textbook parameters (Molar Mass $M$ in $\text{g/mol}$, Edge Length $a$ in $\text{pm}$) and solve for density $d$ in $\text{g/cm}^3$ in real-time.

---

## 🛠️ Technology Stack

*   **Core**: HTML5, Vanilla JavaScript (ES6+).
*   **3D Rendering**: [Three.js](https://threejs.org/) (WebGL) with `OrbitControls` for interactive rotating, panning, and zooming.
*   **Styling**: Custom CSS3 utilizing a premium glassmorphic dark-theme design.
*   **Icons**: [Lucide Icons](https://lucide.dev/).
*   **Mathematics**: [MathJax](https://www.mathjax.org/) for beautiful LaTeX rendering of equations.

---

## 🚀 Running Locally

1.  Clone the repository:
    ```bash
    git clone https://github.com/YourUsername/Latticed.git
    cd Latticed
    ```
2.  Start a local HTTP server to allow Three.js WebGL assets to load properly:
    *   **Python**:
        ```bash
        python -m http.server 8000
        ```
    *   **Node.js**:
        ```bash
        npx http-server -p 8000
        ```
3.  Open `http://localhost:8000` in your web browser.

---

## 🌐 Deploying to GitHub Pages

Since Latticed is a static web application, it can be hosted for free on GitHub Pages:
1.  Push the files (`index.html`, `style.css`, `app.js`) to your GitHub repository.
2.  Go to **Settings** > **Pages** in your repository.
3.  Under **Build and deployment**, select **Deploy from a branch**.
4.  Choose the `main` (or `master`) branch and folder `/ (root)`.
5.  Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/` in a few minutes!
