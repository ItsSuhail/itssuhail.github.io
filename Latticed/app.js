// Latticed - 3D Solid State & Crystal Visualizer Logic

// Global variables for Three.js
let scene, camera, renderer, controls;
let sandboxAtoms = [];
let atomsGroup, bondsGroup, boundsGroup, voidsGroup, planesGroup;
let freeElectronMesh = null;
let freeElectronCenter = new THREE.Vector3();
let electronAngle = 0;
let electronOrbitRadius = 0.6;
let holePulsingMesh = null;
let holePulseTime = 0;
let isInteracting = false;

// Lattice vectors (Cartesian vectors representing the unit cell)
let uA = new THREE.Vector3();
let uB = new THREE.Vector3();
let uC = new THREE.Vector3();

// Active crystal parameters
let aParam = 3.0;
let bParam = 3.0;
let cParam = 3.0;
let alphaParam = 90;
let betaParam = 90;
let gammaParam = 90;

// Application State
let state = {
    category: 'lattices', // 'lattices' | 'bravais' | 'compounds' | 'defects' | 'sandbox'
    model: 'sc',          // 'sc' | 'bcc' | 'fcc' | 'hcp' | 'nacl' | 'cscl' | 'zns' | 'caf2' | 'diamond' | 'schottky' | 'frenkel' | 'doping-n' | 'doping-p'
    bravaisSystem: 'cubic',
    bravaisVariation: 'primitive',
    sandboxSystem: 'cubic',
    sandboxCentering: 'primitive',
    sandboxShowNeighbors: false,
    style: 'ball-stick',  // 'ball-stick' | 'space-fill'
    showBounds: true,
    cutSpheres: false,
    autoRotate: true,
    voids: 'none',        // 'none' | 'tetrahedral' | 'octahedral' | 'both'
    plane: 'none',         // 'none' | '100' | '110' | '111' | 'custom'
    customH: 1,
    customK: 1,
    customL: 1
};

let snapTargetsGroup = null;
let snapPreviewMesh = null;

// Materials dictionary
let materials = {};
let activeClippingPlanes = [];

// Base data for systems (Z, packing efficiency, coordination number, edge relation, description, notes)
const LATTICE_DATA = {
    sc: {
        name: "Simple Cubic (SC)",
        z: 1,
        efficiency: "52.4%",
        cn: 6,
        formula: "a = 2r",
        desc: "In a simple cubic lattice, atoms occupy only the corners of the cube. They touch along the edges, giving the coordination number of 6.",
        notes: [
            "Atoms occupy only the 8 corners of the cube.",
            "Each corner atom is shared by 8 unit cells, contributing 1/8 to each: \\(8 \\times 1/8 = 1\\) atom/cell.",
            "Edge length \\(a\\) and radius \\(r\\) are related by: \\(a = 2r\\).",
            "Relatively open structure with 47.6% void space. Contains a central Cubic Void (size ~ 0.732r)."
        ]
    },
    bcc: {
        name: "Body-Centered Cubic (BCC)",
        z: 2,
        efficiency: "68%",
        cn: 8,
        formula: "a = 4r / √3",
        desc: "In a BCC lattice, atoms occupy all corners and one atom sits at the exact center of the body. Atoms touch along the body diagonal.",
        notes: [
            "Atoms occupy the 8 corners and 1 at the body center.",
            "Rank: \\(8 \\times 1/8\\) (corners) + \\(1\\) (body center) = 2 atoms/cell.",
            "Atoms touch along the body diagonal: \\(a\\sqrt{3} = 4r\\).",
            "Coordination number is 8. Contains 6 Octahedral voids (on faces) and 12 Tetrahedral voids (on faces). Requires adjacent body-center ghost atoms to visualize coordination shape."
        ]
    },
    fcc: {
        name: "Face-Centered Cubic (FCC / CCP)",
        z: 4,
        efficiency: "74%",
        cn: 12,
        formula: "a = 2√2 r",
        desc: "In an FCC (also called CCP) lattice, atoms occupy the corners and the centers of all six faces. Atoms touch along the face diagonal.",
        notes: [
            "Atoms occupy 8 corners and 6 face centers.",
            "Rank: \\(8 \\times 1/8\\) (corners) + \\(6 \\times 1/2\\) (faces) = 4 atoms/cell.",
            "Atoms touch along face diagonals: \\(a\\sqrt{2} = 4r\\).",
            "Coordination number is 12. Contains 8 Tetrahedral voids and 4 Octahedral voids."
        ]
    },
    hcp: {
        name: "Hexagonal Close Packed (HCP)",
        z: 6,
        efficiency: "74%",
        cn: 12,
        formula: "a = 2r, c = a√(8/3)",
        desc: "HCP consists of hexagonal close-packed layers stacked in an ABAB sequence. It offers the same maximum packing efficiency as FCC.",
        notes: [
            "ABAB... layer stacking. The hexagonal unit cell contains 6 net atoms.",
            "Rank: \\(12 \\times 1/6\\) (corners) + \\(2 \\times 1/2\\) (face centers) + \\(3\\) (middle layer) = 6 atoms.",
            "Lattice constants: \\(a = 2r\\), and height \\(c = a\\sqrt{8/3} \\approx 1.633a\\).",
            "Coordination number is 12. Contains 6 Octahedral voids and 12 Tetrahedral voids (6 T1 inside, 6 T2 completed by adjacent mid-layer B-atom ghost atoms)."
        ]
    },
    nacl: {
        name: "Rock Salt Structure (NaCl)",
        z: 4,
        efficiency: "~70%",
        cn: "6 : 6",
        formula: "r⁺ + r⁻ = a/2",
        desc: "The NaCl structure has Cl⁻ ions forming an FCC lattice, with Na⁺ ions occupying all octahedral voids (edge centers and body center).",
        notes: [
            "Cl⁻ ions (green) occupy FCC lattice positions (corners and face centers).",
            "Na⁺ ions (blue) occupy all 12 edge centers and 1 body center (octahedral voids).",
            "Number of Cl⁻ = 4, Na⁺ = 4. Total NaCl formula units per cell = 4.",
            "Each ion is octahedrally coordinated by 6 of the opposite type (6:6 ratio).",
            "Examples: NaCl, LiCl, KCl, MgO, AgCl."
        ]
    },
    cscl: {
        name: "Cesium Chloride (CsCl)",
        z: 1,
        efficiency: "~68%",
        cn: "8 : 8",
        formula: "r⁺ + r⁻ = a√3 / 2",
        desc: "CsCl consists of a simple cubic lattice of Cl⁻ ions with a Cs⁺ ion in the body-centered cubic void, resulting in high coordination.",
        notes: [
            "Cl⁻ ions (green) form a simple cubic lattice.",
            "Cs⁺ ion (purple) sits in the cubic void (body center).",
            "Number of Cl⁻ = 1, Cs⁺ = 1. Total CsCl formula units per cell = 1.",
            "Coordination number for both ions is 8 (8:8 coordination).",
            "Examples: CsCl, CsBr, CsI, NH₄Cl."
        ]
    },
    zns: {
        name: "Zinc Blende (ZnS)",
        z: 4,
        efficiency: "~74% (S²⁻)",
        cn: "4 : 4",
        formula: "r⁺ + r⁻ = a√3 / 4",
        desc: "ZnS features S²⁻ ions in an FCC lattice with Zn²⁺ ions occupying alternate tetrahedral voids (half of the total tetrahedral voids).",
        notes: [
            "S²⁻ ions (yellow) occupy FCC lattice positions.",
            "Zn²⁺ ions (gray) occupy 4 out of the 8 tetrahedral voids.",
            "Total ZnS formula units per unit cell = 4.",
            "Coordination number is 4 (tetrahedral coordination for both Zn²⁺ and S²⁻).",
            "Examples: ZnS (Zinc Blende), CuCl, CuBr, AgI."
        ]
    },
    caf2: {
        name: "Fluorite Structure (CaF₂)",
        z: 4,
        efficiency: "~70%",
        cn: "8 : 4",
        formula: "r⁺ + r⁻ = a√3 / 4",
        desc: "In fluorite, Ca²⁺ ions form an FCC lattice, and F⁻ ions occupy all 8 tetrahedral voids. This gives a coordination ratio of 8:4.",
        notes: [
            "Ca²⁺ ions (blue) occupy FCC lattice positions.",
            "F⁻ ions (orange) occupy all 8 tetrahedral voids.",
            "Number of Ca²⁺ = 4, F⁻ = 8. Ratio is 1:2, giving 4 CaF₂ units per cell.",
            "Coordination number: Ca²⁺ is 8 (cubic), F⁻ is 4 (tetrahedral).",
            "Examples: CaF₂, BaCl₂, SrF₂, PbF₂."
        ]
    },
    diamond: {
        name: "Diamond Structure",
        z: 8,
        efficiency: "34%",
        cn: 4,
        formula: "2r = a√3 / 4",
        desc: "Diamond is a covalent network of carbon. It has Carbon atoms at FCC positions and Carbon atoms occupying half of the tetrahedral voids.",
        notes: [
            "All atoms are Carbon (gray/black).",
            "Positions: FCC positions (4 atoms) + alternate tetrahedral voids (4 atoms) = 8 atoms.",
            "Each carbon is covalently bonded to 4 neighboring carbon atoms (tetrahedral).",
            "Extremely low packing efficiency (34%) but highly stable covalent bonds."
        ]
    },
    schottky: {
        name: "Schottky Defect (NaCl)",
        z: 3,
        efficiency: "52.5%",
        cn: "6 : 6",
        formula: "Density decreases (d_def < d_perf)",
        desc: "A Schottky defect is a stoichiometric vacancy defect in ionic solids. Equal numbers of cations (Na⁺) and anions (Cl⁻) are missing from their lattice sites, lowering the crystal's density.",
        notes: [
            "Stoichiometric defect: Equal numbers of Na⁺ and Cl⁻ ions are missing.",
            "Missing lattice positions are marked by red glowing wireframe spheres.",
            "Rank: Z is reduced from 4.0 to 3.0 per unit cell (representing density decrease).",
            "Common in highly ionic compounds where cations and anions are of similar size.",
            "Examples: NaCl, KCl, CsCl, AgBr."
        ]
    },
    frenkel: {
        name: "Frenkel Defect (AgCl)",
        z: 4,
        efficiency: "~70%",
        cn: "6 : 6 (interstitial is 4)",
        formula: "Density remains unchanged",
        desc: "A Frenkel defect is a dislocation defect in ionic solids. The smaller silver cation (Ag⁺) is dislocated from its normal octahedral lattice site to an interstitial tetrahedral void, leaving a vacancy.",
        notes: [
            "Dislocation defect: Cation Ag⁺ dislocates from normal body center site (0.5, 0.5, 0.5) into a nearby tetrahedral void (0.25, 0.25, 0.25).",
            "The lattice vacancy is shown as a red glowing wireframe sphere.",
            "The dislocated cation sits at the interstitial void (tetrahedral coordination).",
            "Overall rank Z and density remain unchanged, but dielectric constant increases.",
            "Common in compounds with large size differences (ZnS, AgCl, AgBr, AgI). NaCl does NOT show Frenkel defects because Na⁺ is too large."
        ]
    },
    'doping-n': {
        name: "n-type Semiconductor (P-doped)",
        z: 8,
        efficiency: "34%",
        cn: "4",
        formula: "Group 14 doped with Group 15",
        desc: "Doping Silicon or Diamond (Group 14) with a Group 15 impurity like Phosphorus (P). Phosphorus has 5 valence electrons. Four form covalent bonds, while the fifth remains free and becomes delocalized, acting as a charge carrier.",
        notes: [
            "A Carbon/Silicon atom at the alternate tetrahedral void (0.25, 0.25, 0.25) is replaced by a Phosphorus atom (orange-red).",
            "P (5 valence electrons) shares 4 with neighbors, leaving 1 extra conduction electron.",
            "The free electron is visualized as a small light-blue sphere orbiting the dopant atom.",
            "Conductivity increases due to these mobile negative ('n') charge carriers.",
            "Used in transistors, solar cells, and diodes."
        ]
    },
    'doping-p': {
        name: "p-type Semiconductor (B-doped)",
        z: 8,
        efficiency: "34%",
        cn: "4",
        formula: "Group 14 doped with Group 13",
        desc: "Doping Silicon or Diamond (Group 14) with a Group 13 impurity like Boron (B). Boron has only 3 valence electrons, creating an electron vacancy or 'hole' at the fourth bonding site. Nearby electrons can move into this hole, creating a charge carrier.",
        notes: [
            "A Carbon/Silicon atom at (0.25, 0.25, 0.25) is replaced by a Boron atom (purple).",
            "Boron (3 valence electrons) creates a missing bond or 'hole' with one neighbor.",
            "The hole is shown as a glowing violet dashed sphere next to the Boron atom.",
            "The movement of positive ('p') holes in the opposite direction of electrons leads to electrical conduction.",
            "Examples: Silicon/Germanium doped with Boron, Aluminium, or Gallium."
        ]
    }
};

const BRAVAIS_DATA = {
    cubic: {
        name: "Cubic Crystal System",
        params: "a = b = c, α = β = γ = 90°",
        desc: "The simplest and most symmetric system. All three axes are of equal length and perpendicular to each other.",
        variations: ['primitive', 'body', 'face'],
        notes: [
            "Lattice constants: a = b = c, α = β = γ = 90°.",
            "Contains 3 Bravais Lattices: Primitive (P), Body-Centered (I), Face-Centered (F).",
            "Examples: NaCl, Copper, Zinc Blende, Iron, Alum."
        ]
    },
    tetragonal: {
        name: "Tetragonal Crystal System",
        params: "a = b ≠ c, α = β = γ = 90°",
        desc: "Similar to cubic, but stretched along one axis (c is different from a and b). All angles remain 90 degrees.",
        variations: ['primitive', 'body'],
        notes: [
            "Lattice constants: a = b ≠ c, α = β = γ = 90°.",
            "Contains 2 Bravais Lattices: Primitive (P), Body-Centered (I).",
            "Examples: White Tin, SnO₂, TiO₂, CaSO₄."
        ]
    },
    orthorhombic: {
        name: "Orthorhombic Crystal System",
        params: "a ≠ b ≠ c, α = β = γ = 90°",
        desc: "All three axes are of different lengths, but they are all perpendicular. Often compared to a matchbox shape.",
        variations: ['primitive', 'body', 'face', 'end'],
        notes: [
            "Lattice constants: a ≠ b ≠ c, α = β = γ = 90°.",
            "Contains 4 Bravais Lattices: Primitive (P), Body-Centered (I), Face-Centered (F), End-Centered (C).",
            "Examples: Rhombic Sulfur, KNO₃, BaSO₄."
        ]
    },
    hexagonal: {
        name: "Hexagonal Crystal System",
        params: "a = b ≠ c, α = β = 90°, γ = 120°",
        desc: "Has two equal axes in a plane at 120 degrees to each other, and a third perpendicular axis of different length.",
        variations: ['primitive'],
        notes: [
            "Lattice constants: a = b ≠ c, α = β = 90°, γ = 120°.",
            "Contains 1 Bravais Lattice: Primitive (P).",
            "Examples: Graphite, ZnO, CdS, Ice, Magnesium."
        ]
    },
    rhombohedral: {
        name: "Rhombohedral / Trigonal System",
        params: "a = b = c, α = β = γ ≠ 90°",
        desc: "Can be visualized as a cube stretched along its body diagonal. All axes are equal, all angles are equal but not 90°.",
        variations: ['primitive'],
        notes: [
            "Lattice constants: a = b = c, α = β = γ ≠ 90° (usually < 120°).",
            "Contains 1 Bravais Lattice: Primitive (R).",
            "Examples: Calcite (CaCO₃), Cinnabar (HgS), Quartz."
        ]
    },
    monoclinic: {
        name: "Monoclinic Crystal System",
        params: "a ≠ b ≠ c, α = γ = 90°, β ≠ 90°",
        desc: "All three axes are of different lengths. Two angles are perpendicular (90°), but the third angle (β) is skewed.",
        variations: ['primitive', 'end'],
        notes: [
            "Lattice constants: a ≠ b ≠ c, α = γ = 90°, β ≠ 90°.",
            "Contains 2 Bravais Lattices: Primitive (P), End-Centered (C).",
            "Examples: Monoclinic Sulfur, Na₂SO₄·10H₂O."
        ]
    },
    triclinic: {
        name: "Triclinic Crystal System",
        params: "a ≠ b ≠ c, α ≠ β ≠ γ ≠ 90°",
        desc: "The most unsymmetrical system. All axes have different lengths, and all angles are skewed and unequal.",
        variations: ['primitive'],
        notes: [
            "Lattice constants: a ≠ b ≠ c, α ≠ β ≠ γ ≠ 90°.",
            "Contains 1 Bravais Lattice: Primitive (P).",
            "Examples: K₂Cr₂O₇, CuSO₄·5H₂O, H₃BO₃."
        ]
    }
};

// Initialize the 3D scene
function init() {
    const container = document.getElementById('canvas-container');
    
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(6, 5, 8);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.localClippingEnabled = true; // Enable local clipping planes
    container.appendChild(renderer.domElement);
    
    // Controls setup
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 25;
    controls.minDistance = 2;
    
    // Pause auto-rotation when user interacts with the canvas, and resume on release
    controls.addEventListener('start', () => {
        isInteracting = true;
    });
    controls.addEventListener('end', () => {
        isInteracting = false;
    });
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x22223b, 1.5);
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(8, 12, 10);
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.4); // Blue/Indigo fill light
    dirLight2.position.set(-8, -5, -8);
    scene.add(dirLight2);
    
    // Initialize Groups
    atomsGroup = new THREE.Group();
    bondsGroup = new THREE.Group();
    boundsGroup = new THREE.Group();
    voidsGroup = new THREE.Group();
    planesGroup = new THREE.Group();
    snapTargetsGroup = new THREE.Group();
    
    scene.add(atomsGroup);
    scene.add(bondsGroup);
    scene.add(boundsGroup);
    scene.add(voidsGroup);
    scene.add(planesGroup);
    scene.add(snapTargetsGroup);
    
    // Initialize Materials
    initMaterials();
    
    // Generate the initial model
    updateModel();
    
    // Bind Event Listeners
    bindUIEvents();
    
    // Animation loop
    animate();
    
    // Create Lucide Icons
    lucide.createIcons();
}

function initMaterials() {
    materials = {
        cation: new THREE.MeshPhysicalMaterial({
            color: 0x3b82f6, // Blue
            roughness: 0.15,
            metalness: 0.1,
            clearcoat: 0.5
        }),
        anion: new THREE.MeshPhysicalMaterial({
            color: 0x10b981, // Green
            roughness: 0.15,
            metalness: 0.1,
            clearcoat: 0.5
        }),
        carbon: new THREE.MeshStandardMaterial({
            color: 0x4b5563, // Carbon grey
            roughness: 0.3,
            metalness: 0.1
        }),
        metalCu: new THREE.MeshStandardMaterial({
            color: 0xd97706, // Copper orange
            roughness: 0.2,
            metalness: 0.8
        }),
        metalFe: new THREE.MeshStandardMaterial({
            color: 0x64748b, // Steel blue/grey
            roughness: 0.2,
            metalness: 0.7
        }),
        bond: new THREE.MeshStandardMaterial({
            color: 0xe2e8f0, // Silver grey
            roughness: 0.3,
            metalness: 0.4
        }),
        bounds: new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            linewidth: 2
        }),
        voidTetrahedral: new THREE.MeshStandardMaterial({
            color: 0xf97316, // Orange
            transparent: true,
            opacity: 0.65,
            roughness: 0.1,
            blending: THREE.NormalBlending
        }),
        voidOctahedral: new THREE.MeshStandardMaterial({
            color: 0xec4899, // Magenta/Pink
            transparent: true,
            opacity: 0.65,
            roughness: 0.1,
            blending: THREE.NormalBlending
        }),
        millerPlane: new THREE.MeshBasicMaterial({
            color: 0x06b6d4, // Cyan
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        }),
        vacancy: new THREE.MeshBasicMaterial({
            color: 0xef4444, // Red-orange
            wireframe: true,
            transparent: true,
            opacity: 0.6
        }),
        electron: new THREE.MeshBasicMaterial({
            color: 0x60a5fa, // Light blue
            transparent: true,
            opacity: 0.9
        }),
        hole: new THREE.MeshBasicMaterial({
            color: 0xa78bfa, // Light purple
            wireframe: true,
            transparent: true,
            opacity: 0.5
        }),
        voidCubic: new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // Golden yellow
            transparent: true,
            opacity: 0.65,
            roughness: 0.1,
            blending: THREE.NormalBlending
        }),
        ghostAtom: new THREE.MeshStandardMaterial({
            color: 0x3b82f6, // Blue
            transparent: true,
            opacity: 0.25, // Faded
            roughness: 0.2,
            metalness: 0.1
        }),
        voidBond: new THREE.LineBasicMaterial({
            color: 0x94a3b8, // Slate grey
            transparent: true,
            opacity: 0.5,
            linewidth: 1.5
        }),
        boundsGhost: new THREE.LineBasicMaterial({
            color: 0x94a3b8,
            transparent: true,
            opacity: 0.15,
            linewidth: 1
        }),
        collapseAtom: new THREE.MeshStandardMaterial({
            color: 0xef4444,
            roughness: 0.2,
            metalness: 0.1
        }),
        collapseAtomGhost: new THREE.MeshStandardMaterial({
            color: 0xef4444,
            transparent: true,
            opacity: 0.25,
            roughness: 0.2,
            metalness: 0.1
        })
    };
}

// Convert fractional coordinates (x,y,z in [0,1]) to Cartesian (X,Y,Z)
function fractToCart(x, y, z) {
    // Offset the origin so the center of the unit cell (0.5,0.5,0.5) is at (0,0,0) in Cartesian space
    const offset = new THREE.Vector3().add(uA).add(uB).add(uC).multiplyScalar(-0.5);
    
    const X = offset.x + x * uA.x + y * uB.x + z * uC.x;
    const Y = offset.y + x * uA.y + y * uB.y + z * uC.y;
    const Z = offset.z + x * uA.z + y * uB.z + z * uC.z;
    
    return new THREE.Vector3(X, Y, Z);
}

// Update the lattice parameters (a, b, c, alpha, beta, gamma)
function updateLatticeVectors() {
    const alphaRad = (alphaParam * Math.PI) / 180;
    const betaRad = (betaParam * Math.PI) / 180;
    const gammaRad = (gammaParam * Math.PI) / 180;
    
    // a-axis is along Cartesian X-axis
    uA.set(aParam, 0, 0);
    
    // b-axis is in XY plane
    uB.set(bParam * Math.cos(gammaRad), bParam * Math.sin(gammaRad), 0);
    
    // c-axis calculations
    const cosAlpha = Math.cos(alphaRad);
    const cosBeta = Math.cos(betaRad);
    const cosGamma = Math.cos(gammaRad);
    const sinGamma = Math.sin(gammaRad);
    
    const cX = cParam * cosBeta;
    const cY = cParam * (cosAlpha - cosBeta * cosGamma) / sinGamma;
    
    // Volume term for cZ height
    const term = 1 - cosAlpha*cosAlpha - cosBeta*cosBeta - cosGamma*cosGamma + 2*cosAlpha*cosBeta*cosGamma;
    const cZ = cParam * Math.sqrt(Math.max(0, term)) / sinGamma;
    
    uC.set(cX, cY, cZ);
}

// Generate the 6 clipping planes that define the unit cell boundary
function updateClippingPlanes() {
    if (!state.cutSpheres) {
        activeClippingPlanes = [];
        // Clear clipping planes from all materials
        Object.values(materials).forEach(mat => {
            mat.clippingPlanes = null;
        });
        return;
    }
    
    // Origin in fractional coordinates is at x=0, y=0, z=0
    const O = fractToCart(0, 0, 0);
    
    // Face normals pointing inwards:
    // Face x=0: parallel to uB x uC
    const nX0 = new THREE.Vector3().crossVectors(uB, uC).normalize();
    if (nX0.dot(uA) < 0) nX0.negate();
    
    // Face x=1: opposite of Face x=0
    const nX1 = nX0.clone().negate();
    
    // Face y=0: parallel to uC x uA
    const nY0 = new THREE.Vector3().crossVectors(uC, uA).normalize();
    if (nY0.dot(uB) < 0) nY0.negate();
    
    // Face y=1: opposite of Face y=0
    const nY1 = nY0.clone().negate();
    
    // Face z=0: parallel to uA x uB
    const nZ0 = new THREE.Vector3().crossVectors(uA, uB).normalize();
    if (nZ0.dot(uC) < 0) nZ0.negate();
    
    // Face z=1: opposite of Face z=0
    const nZ1 = nZ0.clone().negate();
    
    const ptX1 = fractToCart(1, 0, 0);
    const ptY1 = fractToCart(0, 1, 0);
    const ptZ1 = fractToCart(0, 0, 1);
    
    activeClippingPlanes = [
        new THREE.Plane(nX0, -nX0.dot(O)),
        new THREE.Plane(nX1, -nX1.dot(ptX1)),
        new THREE.Plane(nY0, -nY0.dot(O)),
        new THREE.Plane(nY1, -nY1.dot(ptY1)),
        new THREE.Plane(nZ0, -nZ0.dot(O)),
        new THREE.Plane(nZ1, -nZ1.dot(ptZ1))
    ];
    
    // Apply clipping planes to atom, bond, and void materials
    materials.cation.clippingPlanes = activeClippingPlanes;
    materials.anion.clippingPlanes = activeClippingPlanes;
    materials.carbon.clippingPlanes = activeClippingPlanes;
    materials.metalCu.clippingPlanes = activeClippingPlanes;
    materials.metalFe.clippingPlanes = activeClippingPlanes;
    materials.bond.clippingPlanes = activeClippingPlanes;
    materials.voidTetrahedral.clippingPlanes = activeClippingPlanes;
    materials.voidOctahedral.clippingPlanes = activeClippingPlanes;
    materials.voidCubic.clippingPlanes = activeClippingPlanes;
    materials.ghostAtom.clippingPlanes = activeClippingPlanes;
    materials.voidBond.clippingPlanes = activeClippingPlanes;
    materials.vacancy.clippingPlanes = activeClippingPlanes;
    materials.electron.clippingPlanes = activeClippingPlanes;
    materials.hole.clippingPlanes = activeClippingPlanes;
}

// Clear the scene groups
function clearGroups() {
    freeElectronMesh = null;
    holePulsingMesh = null;
    while (atomsGroup.children.length > 0) atomsGroup.remove(atomsGroup.children[0]);
    while (bondsGroup.children.length > 0) bondsGroup.remove(bondsGroup.children[0]);
    while (boundsGroup.children.length > 0) boundsGroup.remove(boundsGroup.children[0]);
    while (voidsGroup.children.length > 0) voidsGroup.remove(voidsGroup.children[0]);
    while (planesGroup.children.length > 0) planesGroup.remove(planesGroup.children[0]);
}

// Standard sphere renderer helper
function addAtom(position, material, radius) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    atomsGroup.add(mesh);
}

// Render the bounding wireframe of the unit cell
function drawBounds() {
    if (!state.showBounds) return;
    
    // Special case: Hexagonal Close Packing shows a full hexagonal prism outline
    if (state.category === 'lattices' && state.model === 'hcp') {
        const points = [];
        const bottomCorners = [];
        const topCorners = [];
        const cHalf = cParam / 2;
        
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 * Math.PI) / 180;
            const x = aParam * Math.cos(angle);
            const y = aParam * Math.sin(angle);
            bottomCorners.push(new THREE.Vector3(x, y, -cHalf));
            topCorners.push(new THREE.Vector3(x, y, cHalf));
        }
        
        const bottomCenter = new THREE.Vector3(0, 0, -cHalf);
        const topCenter = new THREE.Vector3(0, 0, cHalf);
        
        for (let i = 0; i < 6; i++) {
            const next = (i + 1) % 6;
            // Rings
            points.push(bottomCorners[i], bottomCorners[next]);
            points.push(topCorners[i], topCorners[next]);
            // spokes
            points.push(bottomCenter, bottomCorners[i]);
            points.push(topCenter, topCorners[i]);
            // verticals
            points.push(bottomCorners[i], topCorners[i]);
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.LineSegments(geometry, materials.bounds);
        boundsGroup.add(line);
        return;
    }
    
    // General case: 12-edge parallelepiped
    const points = [];
    const corners = [];
    
    for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
                corners.push(fractToCart(x, y, z));
            }
        }
    }
    
    // Edges along x direction
    points.push(corners[0], corners[4]);
    points.push(corners[1], corners[5]);
    points.push(corners[2], corners[6]);
    points.push(corners[3], corners[7]);
    
    // Edges along y direction
    points.push(corners[0], corners[2]);
    points.push(corners[1], corners[3]);
    points.push(corners[4], corners[6]);
    points.push(corners[5], corners[7]);
    
    // Edges along z direction
    points.push(corners[0], corners[1]);
    points.push(corners[2], corners[3]);
    points.push(corners[4], corners[5]);
    points.push(corners[6], corners[7]);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geometry, materials.bounds);
    boundsGroup.add(line);
}

// Generate cylinder bonds between atoms based on a distance range
function generateBonds(atomsList, minD, maxD) {
    const bondRadius = state.style === 'ball-stick' ? 0.05 : 0.02;
    
    for (let i = 0; i < atomsList.length; i++) {
        for (let j = i + 1; j < atomsList.length; j++) {
            const p1 = atomsList[i].pos;
            const p2 = atomsList[j].pos;
            const dist = p1.distanceTo(p2);
            
            if (dist >= minD && dist <= maxD) {
                const direction = new THREE.Vector3().subVectors(p2, p1);
                const len = direction.length();
                const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
                
                const geom = new THREE.CylinderGeometry(bondRadius, bondRadius, len, 8);
                const mesh = new THREE.Mesh(geom, materials.bond);
                mesh.position.copy(center);
                
                // Align cylinder with direction vector
                const up = new THREE.Vector3(0, 1, 0);
                mesh.quaternion.setFromUnitVectors(up, direction.clone().normalize());
                bondsGroup.add(mesh);
            }
        }
    }
}

// Get active Miller indices from dropdown/inputs
function getActiveMillerIndices() {
    if (state.plane === '100') return { h: 1, k: 0, l: 0 };
    if (state.plane === '110') return { h: 1, k: 1, l: 0 };
    if (state.plane === '111') return { h: 1, k: 1, l: 1 };
    if (state.plane === 'custom') {
        const h = parseFloat(document.getElementById('plane-h').value) || 0;
        const k = parseFloat(document.getElementById('plane-k').value) || 0;
        const l = parseFloat(document.getElementById('plane-l').value) || 0;
        return { h, k, l };
    }
    return null;
}

// Draw Miller plane slices dynamically using general intercepts-edge intersection algorithm
function drawMillerPlane() {
    if (state.plane === 'none' || (state.category === 'lattices' && state.model === 'hcp')) return;
    
    const indices_hkl = getActiveMillerIndices();
    if (!indices_hkl) return;
    const { h, k, l } = indices_hkl;
    if (h === 0 && k === 0 && l === 0) return;
    
    const hkl = new THREE.Vector3(h, k, l);
    const intersects = [];
    
    const cubeEdges = [
        // Edges parallel to X
        { p1: new THREE.Vector3(0, 0, 0), p2: new THREE.Vector3(1, 0, 0) },
        { p1: new THREE.Vector3(0, 1, 0), p2: new THREE.Vector3(1, 1, 0) },
        { p1: new THREE.Vector3(0, 0, 1), p2: new THREE.Vector3(1, 0, 1) },
        { p1: new THREE.Vector3(0, 1, 1), p2: new THREE.Vector3(1, 1, 1) },
        
        // Edges parallel to Y
        { p1: new THREE.Vector3(0, 0, 0), p2: new THREE.Vector3(0, 1, 0) },
        { p1: new THREE.Vector3(1, 0, 0), p2: new THREE.Vector3(1, 1, 0) },
        { p1: new THREE.Vector3(0, 0, 1), p2: new THREE.Vector3(0, 1, 1) },
        { p1: new THREE.Vector3(1, 0, 1), p2: new THREE.Vector3(1, 1, 1) },
        
        // Edges parallel to Z
        { p1: new THREE.Vector3(0, 0, 0), p2: new THREE.Vector3(0, 0, 1) },
        { p1: new THREE.Vector3(1, 0, 0), p2: new THREE.Vector3(1, 0, 1) },
        { p1: new THREE.Vector3(0, 1, 0), p2: new THREE.Vector3(0, 1, 1) },
        { p1: new THREE.Vector3(1, 1, 0), p2: new THREE.Vector3(1, 1, 1) }
    ];
    
    cubeEdges.forEach(edge => {
        const d1 = hkl.dot(edge.p1);
        const d2 = hkl.dot(edge.p2);
        
        if (Math.abs(d2 - d1) > 1e-6) {
            const t = (1.0 - d1) / (d2 - d1);
            if (t >= -1e-6 && t <= 1.0 + 1e-6) {
                const clampedT = Math.max(0, Math.min(1, t));
                const pt = new THREE.Vector3().lerpVectors(edge.p1, edge.p2, clampedT);
                
                let isDuplicate = false;
                for (let i = 0; i < intersects.length; i++) {
                    if (intersects[i].distanceTo(pt) < 1e-4) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    intersects.push(pt);
                }
            }
        } else if (Math.abs(d1 - 1.0) < 1e-6) {
            [edge.p1, edge.p2].forEach(pt => {
                let isDuplicate = false;
                for (let i = 0; i < intersects.length; i++) {
                    if (intersects[i].distanceTo(pt) < 1e-4) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    intersects.push(pt.clone());
                }
            });
        }
    });
    
    if (intersects.length < 3) return;
    
    // Sort vertices coplanar in CCW order around center of mass
    const centerFrac = new THREE.Vector3();
    intersects.forEach(p => centerFrac.add(p));
    centerFrac.multiplyScalar(1 / intersects.length);
    
    const centerCart = fractToCart(centerFrac.x, centerFrac.y, centerFrac.z);
    const intersectsCart = intersects.map(p => fractToCart(p.x, p.y, p.z));
    
    const v0 = new THREE.Vector3().subVectors(intersectsCart[0], centerCart).normalize();
    const v1 = new THREE.Vector3().subVectors(intersectsCart[1], centerCart).normalize();
    const normalCart = new THREE.Vector3().crossVectors(v0, v1).normalize();
    const tangent2 = new THREE.Vector3().crossVectors(normalCart, v0).normalize();
    
    const sorted = intersectsCart.map((p, idx) => {
        const d = new THREE.Vector3().subVectors(p, centerCart);
        const u = d.dot(v0);
        const v = d.dot(tangent2);
        const angle = Math.atan2(v, u);
        return { point: p, angle };
    });
    
    sorted.sort((a, b) => a.angle - b.angle);
    
    const vertices = [];
    const indices = [];
    
    sorted.forEach(s => {
        vertices.push(s.point.x, s.point.y, s.point.z);
    });
    
    for (let i = 1; i < sorted.length - 1; i++) {
        indices.push(0, i, i + 1);
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    
    const mesh = new THREE.Mesh(geom, materials.millerPlane);
    planesGroup.add(mesh);
    
    // Boundary line
    const edgePoints = [];
    for (let i = 0; i < sorted.length; i++) {
        edgePoints.push(sorted[i].point);
        edgePoints.push(sorted[(i + 1) % sorted.length].point);
    }
    const edgeGeom = new THREE.BufferGeometry().setFromPoints(edgePoints);
    const edgeLine = new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2 }));
    planesGroup.add(edgeLine);
}

// Helper to define atoms on the corners, faces, body centers of any cell
function getLatticePositions(variation) {
    const list = [];
    const P = []; // Primitive corners
    
    for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
                P.push(new THREE.Vector3(x, y, z));
            }
        }
    }
    
    // Add corners
    P.forEach(pos => {
        list.push({ fract: pos, type: 'cation' });
    });
    
    if (variation === 'body' || variation === 'body-centered') {
        list.push({ fract: new THREE.Vector3(0.5, 0.5, 0.5), type: 'cation' });
    } else if (variation === 'face' || variation === 'face-centered') {
        // Six face centers
        list.push({ fract: new THREE.Vector3(0.5, 0.5, 0), type: 'cation' });
        list.push({ fract: new THREE.Vector3(0.5, 0.5, 1), type: 'cation' });
        list.push({ fract: new THREE.Vector3(0.5, 0, 0.5), type: 'cation' });
        list.push({ fract: new THREE.Vector3(0.5, 1, 0.5), type: 'cation' });
        list.push({ fract: new THREE.Vector3(0, 0.5, 0.5), type: 'cation' });
        list.push({ fract: new THREE.Vector3(1, 0.5, 0.5), type: 'cation' });
    } else if (variation === 'end' || variation === 'end-centered') {
        // Base centers (z = 0 and z = 1)
        list.push({ fract: new THREE.Vector3(0.5, 0.5, 0), type: 'cation' });
        list.push({ fract: new THREE.Vector3(0.5, 0.5, 1), type: 'cation' });
    }
    
    return list;
}

// Generate the selected crystal visual representation
function updateModel() {
    clearGroups();
    
    // Determine crystal lattice variables based on active selection
    if (state.category === 'lattices') {
        aParam = 3.0; bParam = 3.0; cParam = 3.0;
        alphaParam = 90; betaParam = 90; gammaParam = 90;
        
        if (state.model === 'hcp') {
            cParam = aParam * Math.sqrt(8/3);
            gammaParam = 120;
        }
    } else if (state.category === 'bravais') {
        const sys = BRAVAIS_DATA[state.bravaisSystem];
        if (state.bravaisSystem === 'cubic') {
            aParam = 3.0; bParam = 3.0; cParam = 3.0;
            alphaParam = 90; betaParam = 90; gammaParam = 90;
        } else if (state.bravaisSystem === 'tetragonal') {
            aParam = 3.0; bParam = 3.0; cParam = 4.2;
            alphaParam = 90; betaParam = 90; gammaParam = 90;
        } else if (state.bravaisSystem === 'orthorhombic') {
            aParam = 2.4; bParam = 3.2; cParam = 4.2;
            alphaParam = 90; betaParam = 90; gammaParam = 90;
        } else if (state.bravaisSystem === 'hexagonal') {
            aParam = 3.0; bParam = 3.0; cParam = 4.5;
            alphaParam = 90; betaParam = 90; gammaParam = 120;
        } else if (state.bravaisSystem === 'rhombohedral') {
            aParam = 3.0; bParam = 3.0; cParam = 3.0;
            alphaParam = 75; betaParam = 75; gammaParam = 75;
        } else if (state.bravaisSystem === 'monoclinic') {
            aParam = 2.6; bParam = 3.4; cParam = 4.0;
            alphaParam = 90; betaParam = 105; gammaParam = 90;
        } else if (state.bravaisSystem === 'triclinic') {
            aParam = 2.4; bParam = 3.0; cParam = 3.8;
            alphaParam = 75; betaParam = 85; gammaParam = 100;
        }
    } else if (state.category === 'sandbox') {
        const sys = state.sandboxSystem;
        if (sys === 'cubic') {
            aParam = 3.0; bParam = 3.0; cParam = 3.0;
            alphaParam = 90; betaParam = 90; gammaParam = 90;
        } else if (sys === 'tetragonal') {
            aParam = 3.0; bParam = 3.0; cParam = 4.2;
            alphaParam = 90; betaParam = 90; gammaParam = 90;
        } else if (sys === 'orthorhombic') {
            aParam = 2.4; bParam = 3.2; cParam = 4.2;
            alphaParam = 90; betaParam = 90; gammaParam = 90;
        } else if (sys === 'hexagonal') {
            aParam = 3.0; bParam = 3.0; cParam = 4.5;
            alphaParam = 90; betaParam = 90; gammaParam = 120;
        } else if (sys === 'rhombohedral') {
            aParam = 3.0; bParam = 3.0; cParam = 3.0;
            alphaParam = 75; betaParam = 75; gammaParam = 75;
        } else if (sys === 'monoclinic') {
            aParam = 2.6; bParam = 3.4; cParam = 4.0;
            alphaParam = 90; betaParam = 105; gammaParam = 90;
        } else if (sys === 'triclinic') {
            aParam = 2.4; bParam = 3.0; cParam = 3.8;
            alphaParam = 75; betaParam = 85; gammaParam = 100;
        }
    }
    
    // Calculate lattice vectors in Cartesian space
    updateLatticeVectors();
    
    // Set local clipping boundaries
    updateClippingPlanes();
    
    // Draw wireframe boundary
    drawBounds();
    
    // Draw Slicing Plane
    drawMillerPlane();


    
    // Create Atoms & Bonds Lists
    let atomsData = [];
    let atomRadius = 0.45; // Default ball radius
    
    if (state.category === 'lattices') {
        if (state.model === 'sc') {
            atomRadius = state.style === 'space-fill' ? aParam / 2 : 0.55;
            const latticePos = getLatticePositions('primitive');
            latticePos.forEach(data => {
                atomsData.push({ pos: fractToCart(data.fract.x, data.fract.y, data.fract.z), material: materials.cation, r: atomRadius });
            });
            // Generate bonds
            if (state.style === 'ball-stick') {
                generateBonds(atomsData, aParam - 0.1, aParam + 0.1);
            }
            
            // Highlight Voids inside SC
            drawSCVoids(atomRadius);
        } else if (state.model === 'bcc') {
            atomRadius = state.style === 'space-fill' ? (aParam * Math.sqrt(3)) / 4 : 0.55;
            const latticePos = getLatticePositions('body');
            latticePos.forEach(data => {
                atomsData.push({ pos: fractToCart(data.fract.x, data.fract.y, data.fract.z), material: materials.cation, r: atomRadius });
            });
            // Generate bonds: corners to center
            if (state.style === 'ball-stick') {
                const cornerToCenter = (aParam * Math.sqrt(3)) / 2;
                generateBonds(atomsData, cornerToCenter - 0.1, cornerToCenter + 0.1);
            }
            
            // Highlight Voids inside BCC
            drawBCCVoids(atomRadius);
        } else if (state.model === 'fcc') {
            atomRadius = state.style === 'space-fill' ? (aParam * Math.sqrt(2)) / 4 : 0.55;
            const latticePos = getLatticePositions('face');
            latticePos.forEach(data => {
                atomsData.push({ pos: fractToCart(data.fract.x, data.fract.y, data.fract.z), material: materials.cation, r: atomRadius });
            });
            // Generate bonds: corners to face centers, and face-centers to face-centers
            if (state.style === 'ball-stick') {
                const neighborDist = (aParam * Math.sqrt(2)) / 2;
                generateBonds(atomsData, neighborDist - 0.1, neighborDist + 0.1);
            }
            
            // Highlight Voids inside FCC
            drawFCCVoids(atomRadius);
        } else if (state.model === 'hcp') {
            // Hexagonal Close Packing - Full hexagonal prism representation
            atomRadius = state.style === 'space-fill' ? aParam / 2 : 0.52;
            const cHalf = cParam / 2;
            
            const rawAtoms = [];
            
            // A sublattice — Bottom plane (Z = -c/2)
            // Role 'center': the hexagonal prism center atom bonds only to its 6 ring atoms, not to B-layer atoms.
            // The B-layer (mid) atoms nestle into triangular pockets formed by ring pairs only.
            rawAtoms.push({ pos: new THREE.Vector3(0, 0, -cHalf), type: 'A', role: 'center' });
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60 * Math.PI) / 180;
                rawAtoms.push({ pos: new THREE.Vector3(aParam * Math.cos(angle), aParam * Math.sin(angle), -cHalf), type: 'A', role: 'ring' });
            }
            
            // A sublattice — Top plane (Z = c/2)
            rawAtoms.push({ pos: new THREE.Vector3(0, 0, cHalf), type: 'A', role: 'center' });
            for (let i = 0; i < 6; i++) {
                const angle = (i * 60 * Math.PI) / 180;
                rawAtoms.push({ pos: new THREE.Vector3(aParam * Math.cos(angle), aParam * Math.sin(angle), cHalf), type: 'A', role: 'ring' });
            }
            
            // B sublattice — Mid plane (Z = 0) — 3 interstitial B-layer atoms
            const rMid = aParam / Math.sqrt(3);
            const midAngles = [30, 150, 270];
            for (let i = 0; i < 3; i++) {
                const angle = (midAngles[i] * Math.PI) / 180;
                rawAtoms.push({ pos: new THREE.Vector3(rMid * Math.cos(angle), rMid * Math.sin(angle), 0), type: 'B', role: 'mid' });
            }
            
            rawAtoms.forEach(atom => {
                atomsData.push({ pos: atom.pos, material: materials.cation, r: atomRadius });
            });
            
            // Generate HCP bonds with crystallographic accuracy:
            //   A-ring ↔ A-ring (adjacent, same plane) = a  → BOND
            //   A-center ↔ A-ring (same plane)          = a  → BOND
            //   A-ring ↔ B-mid (cross-layer)            = a  → BOND (each mid bonds to 2 ring per layer)
            //   A-center ↔ B-mid  — SKIP: center is NOT one of the 3 pocket-forming ring atoms
            //   B-mid ↔ B-mid     — SKIP: same sublattice, no real bond
            if (state.style === 'ball-stick') {
                const bondRadius = 0.05;
                const minD = aParam - 0.1;
                const maxD = aParam + 0.1;
                for (let i = 0; i < rawAtoms.length; i++) {
                    for (let j = i + 1; j < rawAtoms.length; j++) {
                        const ri = rawAtoms[i], rj = rawAtoms[j];
                        // Skip B↔B (mid–mid): same sublattice
                        if (ri.type === 'B' && rj.type === 'B') continue;
                        // Skip center↔B: center atom is NOT a bonding partner for mid atoms
                        if ((ri.role === 'center' && rj.role === 'mid') ||
                            (ri.role === 'mid' && rj.role === 'center')) continue;
                        const p1 = ri.pos;
                        const p2 = rj.pos;
                        const d = p1.distanceTo(p2);
                        if (d >= minD && d <= maxD) {
                            const dir = new THREE.Vector3().subVectors(p2, p1);
                            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
                            const geom = new THREE.CylinderGeometry(bondRadius, bondRadius, d, 8);
                            const bond = new THREE.Mesh(geom, materials.bond);
                            bond.position.copy(mid);
                            bond.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
                            bondsGroup.add(bond);
                        }
                    }
                }
            }
            
            // Highlight Voids inside HCP
            drawHCPVoids(atomRadius);
        }
    } else if (state.category === 'bravais') {
        const latticePos = getLatticePositions(state.bravaisVariation);
        
        // Define average radius for Bravais display
        const minParam = Math.min(aParam, bParam, cParam);
        atomRadius = state.style === 'space-fill' ? minParam * 0.35 : 0.45;
        
        latticePos.forEach(data => {
            atomsData.push({ pos: fractToCart(data.fract.x, data.fract.y, data.fract.z), material: materials.cation, r: atomRadius });
        });
        
        // Generate Bravais bonds (just primitive lines for visualization)
        if (state.style === 'ball-stick') {
            generateBonds(atomsData, 0.1, Math.max(aParam, bParam, cParam) + 0.2);
        }
    } else if (state.category === 'compounds') {
        if (state.model === 'nacl') {
            // NaCl compound: Cl- at FCC, Na+ at Octahedral Voids
            const rCl = state.style === 'space-fill' ? aParam * 0.33 : 0.55;
            const rNa = state.style === 'space-fill' ? aParam * 0.17 : 0.38;
            
            // Cl- ions (Anions - green)
            const fccCl = getLatticePositions('face');
            fccCl.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: materials.anion, r: rCl });
            });
            
            // Na+ ions (Cations - blue) at body center + 12 edge centers
            const octNa = [
                new THREE.Vector3(0.5, 0.5, 0.5), // body center
                new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(0.5, 1, 0), new THREE.Vector3(0.5, 0, 1), new THREE.Vector3(0.5, 1, 1),
                new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(1, 0.5, 0), new THREE.Vector3(0, 0.5, 1), new THREE.Vector3(1, 0.5, 1),
                new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(1, 0, 0.5), new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(1, 1, 0.5)
            ];
            octNa.forEach(pos => {
                atomsData.push({ pos: fractToCart(pos.x, pos.y, pos.z), material: materials.cation, r: rNa });
            });
            
            // Generate bonds between Na+ and Cl- (distance 0.5 * a)
            if (state.style === 'ball-stick') {
                generateBonds(atomsData, (aParam/2) - 0.1, (aParam/2) + 0.1);
            }
        } else if (state.model === 'cscl') {
            // CsCl: Cl- at simple cubic (corners), Cs+ at body center
            const rCl = state.style === 'space-fill' ? aParam * 0.4 : 0.45;
            const rCs = state.style === 'space-fill' ? (aParam * Math.sqrt(3))/2 - rCl : 0.65;
            
            // Cl- at corners (green)
            const scCl = getLatticePositions('primitive');
            scCl.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: materials.anion, r: rCl });
            });
            
            // Cs+ at body center (purple - re-colored cation)
            const csMat = materials.cation.clone();
            csMat.color.setHex(0x8b5cf6); // Cs+ is violet/purple
            
            const csPos = fractToCart(0.5, 0.5, 0.5);
            atomsData.push({ pos: csPos, material: csMat, r: rCs });
            
            // Generate bonds: corners to body center
            if (state.style === 'ball-stick') {
                const cornerToCenter = (aParam * Math.sqrt(3)) / 2;
                generateBonds(atomsData, cornerToCenter - 0.1, cornerToCenter + 0.1);
            }
        } else if (state.model === 'zns') {
            // ZnS: S2- at FCC, Zn2+ at half tetrahedral voids
            const rS = state.style === 'space-fill' ? aParam * 0.32 : 0.55;
            const rZn = state.style === 'space-fill' ? (aParam * Math.sqrt(3))/4 - rS : 0.4;
            
            // S2- at FCC (Anion: re-colored to yellow for sulfur)
            const sMat = materials.anion.clone();
            sMat.color.setHex(0xeab308); // Sulfide yellow
            
            const fccS = getLatticePositions('face');
            fccS.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: sMat, r: rS });
            });
            
            // Zn2+ at alternate tetrahedral voids
            const tvZn = [
                new THREE.Vector3(0.25, 0.25, 0.25),
                new THREE.Vector3(0.75, 0.75, 0.25),
                new THREE.Vector3(0.75, 0.25, 0.75),
                new THREE.Vector3(0.25, 0.75, 0.75)
            ];
            
            const znMat = materials.cation.clone();
            znMat.color.setHex(0x64748b); // Zinc grey
            
            tvZn.forEach(pos => {
                atomsData.push({ pos: fractToCart(pos.x, pos.y, pos.z), material: znMat, r: rZn });
            });
            
            // Generate bonds between Zn and S (tetrahedral distance = a * sqrt(3) / 4)
            if (state.style === 'ball-stick') {
                const tetDist = (aParam * Math.sqrt(3)) / 4;
                generateBonds(atomsData, tetDist - 0.1, tetDist + 0.1);
            }
        } else if (state.model === 'caf2') {
            // CaF2: Ca2+ at FCC, F- at all tetrahedral voids
            const rCa = state.style === 'space-fill' ? aParam * 0.3 : 0.55;
            const rF = state.style === 'space-fill' ? (aParam * Math.sqrt(3))/4 - rCa : 0.35;
            
            // Ca2+ at FCC (Cation: blue)
            const fccCa = getLatticePositions('face');
            fccCa.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: materials.cation, r: rCa });
            });
            
            // F- at all 8 tetrahedral voids (Anion: re-colored to orange)
            const fMat = materials.anion.clone();
            fMat.color.setHex(0xf97316); // Fluoride orange
            
            const tvF = [
                new THREE.Vector3(0.25, 0.25, 0.25), new THREE.Vector3(0.75, 0.25, 0.25),
                new THREE.Vector3(0.25, 0.75, 0.25), new THREE.Vector3(0.75, 0.75, 0.25),
                new THREE.Vector3(0.25, 0.25, 0.75), new THREE.Vector3(0.75, 0.25, 0.75),
                new THREE.Vector3(0.25, 0.75, 0.75), new THREE.Vector3(0.75, 0.75, 0.75)
            ];
            tvF.forEach(pos => {
                atomsData.push({ pos: fractToCart(pos.x, pos.y, pos.z), material: fMat, r: rF });
            });
            
            // Generate bonds between Ca and F
            if (state.style === 'ball-stick') {
                const tetDist = (aParam * Math.sqrt(3)) / 4;
                generateBonds(atomsData, tetDist - 0.1, tetDist + 0.1);
            }
        } else if (state.model === 'diamond') {
            // Diamond: C at FCC + 1/2 TV (all Carbon)
            atomRadius = state.style === 'space-fill' ? (aParam * Math.sqrt(3)) / 8 : 0.45;
            
            // C at FCC
            const fccC = getLatticePositions('face');
            fccC.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: materials.carbon, r: atomRadius });
            });
            
            // C at alternate tetrahedral voids
            const tvC = [
                new THREE.Vector3(0.25, 0.25, 0.25),
                new THREE.Vector3(0.75, 0.75, 0.25),
                new THREE.Vector3(0.75, 0.25, 0.75),
                new THREE.Vector3(0.25, 0.75, 0.75)
            ];
            tvC.forEach(pos => {
                atomsData.push({ pos: fractToCart(pos.x, pos.y, pos.z), material: materials.carbon, r: atomRadius });
            });
            
            // Generate covalent C-C bonds (coordination distance)
            if (state.style === 'ball-stick') {
                const tetDist = (aParam * Math.sqrt(3)) / 4;
                generateBonds(atomsData, tetDist - 0.1, tetDist + 0.1);
            }
        }
    } else if (state.category === 'defects') {
        if (state.model === 'schottky') {
            const rCl = state.style === 'space-fill' ? aParam * 0.33 : 0.55;
            const rNa = state.style === 'space-fill' ? aParam * 0.17 : 0.38;
            
            const fccCl = getLatticePositions('face');
            fccCl.forEach(d => {
                const pos = d.fract;
                const cartPos = fractToCart(pos.x, pos.y, pos.z);
                // Schottky Cl vacancies at (1, 0.5, 0.5) and (0, 0.5, 0.5) (each contributes 0.5 net)
                if ((Math.abs(pos.x - 1.0) < 0.01 && Math.abs(pos.y - 0.5) < 0.01 && Math.abs(pos.z - 0.5) < 0.01) ||
                    (Math.abs(pos.x - 0.0) < 0.01 && Math.abs(pos.y - 0.5) < 0.01 && Math.abs(pos.z - 0.5) < 0.01)) {
                    addAtom(cartPos, materials.vacancy, rCl);
                } else {
                    atomsData.push({ pos: cartPos, material: materials.anion, r: rCl });
                }
            });
            
            const octNa = [
                new THREE.Vector3(0.5, 0.5, 0.5),
                new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(0.5, 1, 0), new THREE.Vector3(0.5, 0, 1), new THREE.Vector3(0.5, 1, 1),
                new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(1, 0.5, 0), new THREE.Vector3(0, 0.5, 1), new THREE.Vector3(1, 0.5, 1),
                new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(1, 0, 0.5), new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(1, 1, 0.5)
            ];
            octNa.forEach(pos => {
                const cartPos = fractToCart(pos.x, pos.y, pos.z);
                // Schottky Na vacancy at body center (0.5, 0.5, 0.5) (contributes 1.0 net)
                if (Math.abs(pos.x - 0.5) < 0.01 && Math.abs(pos.y - 0.5) < 0.01 && Math.abs(pos.z - 0.5) < 0.01) {
                    addAtom(cartPos, materials.vacancy, rNa);
                } else {
                    atomsData.push({ pos: cartPos, material: materials.cation, r: rNa });
                }
            });
            
            if (state.style === 'ball-stick') {
                generateBonds(atomsData, (aParam/2) - 0.1, (aParam/2) + 0.1);
            }
        } else if (state.model === 'frenkel') {
            const rCl = state.style === 'space-fill' ? aParam * 0.33 : 0.55;
            const rAg = state.style === 'space-fill' ? aParam * 0.17 : 0.38;
            
            const fccCl = getLatticePositions('face');
            fccCl.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: materials.anion, r: rCl });
            });
            
            const octAg = [
                new THREE.Vector3(0.5, 0.5, 0.5),
                new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(0.5, 1, 0), new THREE.Vector3(0.5, 0, 1), new THREE.Vector3(0.5, 1, 1),
                new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(1, 0.5, 0), new THREE.Vector3(0, 0.5, 1), new THREE.Vector3(1, 0.5, 1),
                new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(1, 0, 0.5), new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(1, 1, 0.5)
            ];
            octAg.forEach(pos => {
                const cartPos = fractToCart(pos.x, pos.y, pos.z);
                // Frenkel Ag vacancy at body center (0.5, 0.5, 0.5) (contributes 1.0 net)
                if (Math.abs(pos.x - 0.5) < 0.01 && Math.abs(pos.y - 0.5) < 0.01 && Math.abs(pos.z - 0.5) < 0.01) {
                    addAtom(cartPos, materials.vacancy, rAg);
                } else {
                    atomsData.push({ pos: cartPos, material: materials.cation, r: rAg });
                }
            });
            
            // Dislocated cation at interstitial tetrahedral void
            const interstitialPos = fractToCart(0.25, 0.25, 0.25);
            atomsData.push({ pos: interstitialPos, material: materials.cation, r: rAg });
            
            if (state.style === 'ball-stick') {
                // Pass 1: Ag_oct — Cl bonds (octahedral coordination, dist = a/2)
                generateBonds(atomsData, (aParam/2) - 0.1, (aParam/2) + 0.1);
                // Pass 2: Ag_int — Cl bonds only (tetrahedral void, dist = a√3/4)
                // Cannot use generic generateBonds because Ag_oct atoms are also
                // at dist a√3/4 from the interstitial → spurious Ag-Ag bonds.
                // Instead, explicitly bond the interstitial only to its 4 Cl neighbors.
                const tetDist = (aParam * Math.sqrt(3)) / 4;
                const interstitialCartPos = interstitialPos;
                atomsData.forEach(atom => {
                    // Only bond to anions (Cl-), never to other cations
                    if (atom.material !== materials.anion) return;
                    const d = interstitialCartPos.distanceTo(atom.pos);
                    if (d >= tetDist - 0.1 && d <= tetDist + 0.1) {
                        const direction = new THREE.Vector3().subVectors(atom.pos, interstitialCartPos);
                        const len = direction.length();
                        const center = new THREE.Vector3().addVectors(interstitialCartPos, atom.pos).multiplyScalar(0.5);
                        const bondRadius = state.style === 'ball-stick' ? 0.05 : 0.02;
                        const geom = new THREE.CylinderGeometry(bondRadius, bondRadius, len, 8);
                        const mesh = new THREE.Mesh(geom, materials.bond);
                        mesh.position.copy(center);
                        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
                        bondsGroup.add(mesh);
                    }
                });
            }
        } else if (state.model === 'doping-n') {
            atomRadius = state.style === 'space-fill' ? (aParam * Math.sqrt(3)) / 8 : 0.45;
            
            const fccC = getLatticePositions('face');
            fccC.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: materials.carbon, r: atomRadius });
            });
            
            const tvC = [
                new THREE.Vector3(0.25, 0.25, 0.25),
                new THREE.Vector3(0.75, 0.75, 0.25),
                new THREE.Vector3(0.75, 0.25, 0.75),
                new THREE.Vector3(0.25, 0.75, 0.75)
            ];
            
            const pMat = materials.cation.clone();
            pMat.color.setHex(0xf97316); // Orange-red for Phosphorus
            
            tvC.forEach(pos => {
                const cartPos = fractToCart(pos.x, pos.y, pos.z);
                if (pos.x === 0.25 && pos.y === 0.25 && pos.z === 0.25) {
                    atomsData.push({ pos: cartPos, material: pMat, r: atomRadius * 1.15 });
                } else {
                    atomsData.push({ pos: cartPos, material: materials.carbon, r: atomRadius });
                }
            });
            
            if (state.style === 'ball-stick') {
                const tetDist = (aParam * Math.sqrt(3)) / 4;
                generateBonds(atomsData, tetDist - 0.1, tetDist + 0.1);
            }
            
            // Orbiting Electron
            const center = fractToCart(0.25, 0.25, 0.25);
            const geom = new THREE.SphereGeometry(atomRadius * 0.3, 16, 16);
            freeElectronMesh = new THREE.Mesh(geom, materials.electron);
            freeElectronCenter.copy(center);
            freeElectronMesh.position.copy(center).add(new THREE.Vector3(0.7, 0, 0));
            atomsGroup.add(freeElectronMesh);
            
        } else if (state.model === 'doping-p') {
            atomRadius = state.style === 'space-fill' ? (aParam * Math.sqrt(3)) / 8 : 0.45;
            
            const fccC = getLatticePositions('face');
            fccC.forEach(d => {
                atomsData.push({ pos: fractToCart(d.fract.x, d.fract.y, d.fract.z), material: materials.carbon, r: atomRadius });
            });
            
            const tvC = [
                new THREE.Vector3(0.25, 0.25, 0.25),
                new THREE.Vector3(0.75, 0.75, 0.25),
                new THREE.Vector3(0.75, 0.25, 0.75),
                new THREE.Vector3(0.25, 0.75, 0.75)
            ];
            
            const bMat = materials.cation.clone();
            bMat.color.setHex(0xa78bfa); // Boron purple
            
            tvC.forEach(pos => {
                const cartPos = fractToCart(pos.x, pos.y, pos.z);
                if (pos.x === 0.25 && pos.y === 0.25 && pos.z === 0.25) {
                    atomsData.push({ pos: cartPos, material: bMat, r: atomRadius * 0.95 });
                } else {
                    atomsData.push({ pos: cartPos, material: materials.carbon, r: atomRadius });
                }
            });
            
            if (state.style === 'ball-stick') {
                const tetDist = (aParam * Math.sqrt(3)) / 4;
                generateBonds(atomsData, tetDist - 0.1, tetDist + 0.1);
            }
            
            // Vacancy Hole
            const bPos = fractToCart(0.25, 0.25, 0.25);
            const cornerPos = fractToCart(0, 0, 0);
            const holePos = new THREE.Vector3().addVectors(bPos, cornerPos).multiplyScalar(0.5);
            
            const geom = new THREE.SphereGeometry(atomRadius * 0.4, 16, 16);
            holePulsingMesh = new THREE.Mesh(geom, materials.hole);
            holePulsingMesh.position.copy(holePos);
            atomsGroup.add(holePulsingMesh);
        }
    } else if (state.category === 'sandbox') {
        drawSandboxModel();
        updateDetailsUI();
        updateLegendUI();
        return;
    }
    
    // Add atoms to scene
    atomsData.forEach(atom => {
        addAtom(atom.pos, atom.material, atom.r);
    });
    
    // Update the HTML text cards and calculations
    updateDetailsUI();
    updateLegendUI();
}

// Helper to draw dashed coordination lines from a center point to an array of target points
function drawCoordinationLines(center, targets) {
    targets.forEach(target => {
        const points = [center, target];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geom, materials.voidBond);
        voidsGroup.add(line);
    });
}

// Helper to render a semi-transparent ghost atom at adjacent cell positions
function addGhostAtom(position, radius) {
    let duplicate = false;
    voidsGroup.children.forEach(c => {
        if (c.geometry && c.geometry.type === 'SphereGeometry' && c.position.distanceTo(position) < 0.01 && c.material === materials.ghostAtom) {
            duplicate = true;
        }
    });
    
    if (!duplicate) {
        const geom = new THREE.SphereGeometry(radius, 24, 24);
        const mesh = new THREE.Mesh(geom, materials.ghostAtom);
        mesh.position.copy(position);
        voidsGroup.add(mesh);
        
        // Add a thin wireframe border to make it look distinct
        const wireMat = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        const wireMesh = new THREE.Mesh(geom, wireMat);
        wireMesh.position.copy(position);
        voidsGroup.add(wireMesh);
    }
}

// Highlight Cubic void in Simple Cubic (SC)
function drawSCVoids(atomRadius) {
    if (state.voids === 'none' || state.voids !== 'cubic') return;
    
    const rCubic = state.style === 'space-fill' ? atomRadius * (Math.sqrt(3) - 1) : 0.35;
    
    const voidPosCart = fractToCart(0.5, 0.5, 0.5);
    
    // Add void mesh
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(rCubic, 24, 24), materials.voidCubic);
    mesh.position.copy(voidPosCart);
    voidsGroup.add(mesh);
    
    // Surrounding atoms (8 corners)
    const corners = [];
    for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
                corners.push(fractToCart(x, y, z));
            }
        }
    }
    
    drawCoordinationLines(voidPosCart, corners);
}

// Highlight Tetrahedral/Octahedral voids in BCC
function drawBCCVoids(atomRadius) {
    if (state.voids === 'none') return;
    
    const rOct = state.style === 'space-fill' ? atomRadius * 0.154 : 0.15;
    const rTet = state.style === 'space-fill' ? atomRadius * 0.291 : 0.20;
    
    const bodyCenterCart = fractToCart(0.5, 0.5, 0.5);
    
    // 1. Octahedral Voids (Face Centers)
    if (state.voids === 'octahedral' || state.voids === 'both') {
        const faceCenters = [
            { pos: new THREE.Vector3(0.5, 0.5, 0), ghostDir: new THREE.Vector3(0, 0, -1), corners: [new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(1,1,0)] },
            { pos: new THREE.Vector3(0.5, 0.5, 1), ghostDir: new THREE.Vector3(0, 0, 1), corners: [new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,1), new THREE.Vector3(0,1,1), new THREE.Vector3(1,1,1)] },
            { pos: new THREE.Vector3(0.5, 0, 0.5), ghostDir: new THREE.Vector3(0, -1, 0), corners: [new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,1)] },
            { pos: new THREE.Vector3(0.5, 1, 0.5), ghostDir: new THREE.Vector3(0, 1, 0), corners: [new THREE.Vector3(0,1,0), new THREE.Vector3(1,1,0), new THREE.Vector3(0,1,1), new THREE.Vector3(1,1,1)] },
            { pos: new THREE.Vector3(0, 0.5, 0.5), ghostDir: new THREE.Vector3(-1, 0, 0), corners: [new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1), new THREE.Vector3(0,1,1)] },
            { pos: new THREE.Vector3(1, 0.5, 0.5), ghostDir: new THREE.Vector3(1, 0, 0), corners: [new THREE.Vector3(1,0,0), new THREE.Vector3(1,1,0), new THREE.Vector3(1,0,1), new THREE.Vector3(1,1,1)] }
        ];
        
        faceCenters.forEach(fc => {
            const voidPosCart = fractToCart(fc.pos.x, fc.pos.y, fc.pos.z);
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(rOct, 16, 16), materials.voidOctahedral);
            mesh.position.copy(voidPosCart);
            voidsGroup.add(mesh);
            
            // Adjacent body center (ghost atom)
            const ghostPosFrac = new THREE.Vector3(0.5, 0.5, 0.5).add(fc.ghostDir);
            const ghostPosCart = fractToCart(ghostPosFrac.x, ghostPosFrac.y, ghostPosFrac.z);
            addGhostAtom(ghostPosCart, atomRadius);
            
            // Coordination lines: 4 corners + current body center + ghost body center
            const coordinating = [
                bodyCenterCart,
                ghostPosCart,
                ...fc.corners.map(c => fractToCart(c.x, c.y, c.z))
            ];
            drawCoordinationLines(voidPosCart, coordinating);
        });
    }
    
    // 2. Tetrahedral Voids (Render on faces z=0 and z=1)
    if (state.voids === 'tetrahedral' || state.voids === 'both') {
        const tetVoids = [
            { pos: new THREE.Vector3(0.5, 0.25, 0), ghostDir: new THREE.Vector3(0,0,-1), corners: [new THREE.Vector3(0,0,0), new THREE.Vector3(1,0,0)] },
            { pos: new THREE.Vector3(0.5, 0.75, 0), ghostDir: new THREE.Vector3(0,0,-1), corners: [new THREE.Vector3(0,1,0), new THREE.Vector3(1,1,0)] },
            { pos: new THREE.Vector3(0.25, 0.5, 0), ghostDir: new THREE.Vector3(0,0,-1), corners: [new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0)] },
            { pos: new THREE.Vector3(0.75, 0.5, 0), ghostDir: new THREE.Vector3(0,0,-1), corners: [new THREE.Vector3(1,0,0), new THREE.Vector3(1,1,0)] },
            
            { pos: new THREE.Vector3(0.5, 0.25, 1), ghostDir: new THREE.Vector3(0,0,1), corners: [new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,1)] },
            { pos: new THREE.Vector3(0.5, 0.75, 1), ghostDir: new THREE.Vector3(0,0,1), corners: [new THREE.Vector3(0,1,1), new THREE.Vector3(1,1,1)] },
            { pos: new THREE.Vector3(0.25, 0.5, 1), ghostDir: new THREE.Vector3(0,0,1), corners: [new THREE.Vector3(0,0,1), new THREE.Vector3(0,1,1)] },
            { pos: new THREE.Vector3(0.75, 0.5, 1), ghostDir: new THREE.Vector3(0,0,1), corners: [new THREE.Vector3(1,0,1), new THREE.Vector3(1,1,1)] }
        ];
        
        tetVoids.forEach(tv => {
            const voidPosCart = fractToCart(tv.pos.x, tv.pos.y, tv.pos.z);
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(rTet, 16, 16), materials.voidTetrahedral);
            mesh.position.copy(voidPosCart);
            voidsGroup.add(mesh);
            
            const ghostPosFrac = new THREE.Vector3(0.5, 0.5, 0.5).add(tv.ghostDir);
            const ghostPosCart = fractToCart(ghostPosFrac.x, ghostPosFrac.y, ghostPosFrac.z);
            addGhostAtom(ghostPosCart, atomRadius);
            
            const coordinating = [
                bodyCenterCart,
                ghostPosCart,
                ...tv.corners.map(c => fractToCart(c.x, c.y, c.z))
            ];
            drawCoordinationLines(voidPosCart, coordinating);
        });
    }
}

// Highlight Tetrahedral/Octahedral voids in FCC
function drawFCCVoids(atomRadius) {
    if (state.voids === 'none') return;
    
    const rOct = state.style === 'space-fill' ? atomRadius * 0.414 : 0.28;
    const rTet = state.style === 'space-fill' ? atomRadius * 0.225 : 0.18;
    
    // Octahedral voids (Magenta)
    if (state.voids === 'octahedral' || state.voids === 'both') {
        const octPos = [
            new THREE.Vector3(0.5, 0.5, 0.5), // Body center
            new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(0.5, 1, 0), new THREE.Vector3(0.5, 0, 1), new THREE.Vector3(0.5, 1, 1),
            new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(1, 0.5, 0), new THREE.Vector3(0, 0.5, 1), new THREE.Vector3(1, 0.5, 1),
            new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(1, 0, 0.5), new THREE.Vector3(0, 1, 0.5), new THREE.Vector3(1, 1, 0.5)
        ];
        
        octPos.forEach(pos => {
            const voidPosCart = fractToCart(pos.x, pos.y, pos.z);
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(rOct, 16, 16), materials.voidOctahedral);
            mesh.position.copy(voidPosCart);
            voidsGroup.add(mesh);
            
            // Only draw coordination lines for the body center void to avoid visual clutter
            if (pos.x === 0.5 && pos.y === 0.5 && pos.z === 0.5) {
                const faceCenters = [
                    fractToCart(0.5, 0.5, 0), fractToCart(0.5, 0.5, 1),
                    fractToCart(0.5, 0, 0.5), fractToCart(0.5, 1, 0.5),
                    fractToCart(0, 0.5, 0.5), fractToCart(1, 0.5, 0.5)
                ];
                drawCoordinationLines(voidPosCart, faceCenters);
            }
        });
    }
    
    // Tetrahedral voids (Orange)
    if (state.voids === 'tetrahedral' || state.voids === 'both') {
        const tetPos = [
            new THREE.Vector3(0.25, 0.25, 0.25), new THREE.Vector3(0.75, 0.25, 0.25),
            new THREE.Vector3(0.25, 0.75, 0.25), new THREE.Vector3(0.75, 0.75, 0.25),
            new THREE.Vector3(0.25, 0.25, 0.75), new THREE.Vector3(0.75, 0.25, 0.75),
            new THREE.Vector3(0.25, 0.75, 0.75), new THREE.Vector3(0.75, 0.75, 0.75)
        ];
        
        tetPos.forEach(pos => {
            const voidPosCart = fractToCart(pos.x, pos.y, pos.z);
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(rTet, 16, 16), materials.voidTetrahedral);
            mesh.position.copy(voidPosCart);
            voidsGroup.add(mesh);
            
            const cornerX = pos.x < 0.5 ? 0 : 1;
            const cornerY = pos.y < 0.5 ? 0 : 1;
            const cornerZ = pos.z < 0.5 ? 0 : 1;
            
            const coordinating = [
                fractToCart(cornerX, cornerY, cornerZ),
                fractToCart(0.5, cornerY, cornerZ),
                fractToCart(cornerX, 0.5, cornerZ),
                fractToCart(cornerX, cornerY, 0.5)
            ];
            drawCoordinationLines(voidPosCart, coordinating);
        });
    }
}

// Highlight Tetrahedral/Octahedral voids in HCP
function drawHCPVoids(atomRadius) {
    if (state.voids === 'none') return;
    
    const rOct = state.style === 'space-fill' ? atomRadius * 0.414 : 0.26;
    const rTet = state.style === 'space-fill' ? atomRadius * 0.225 : 0.16;
    const cHalf = cParam / 2;
    
    // Bottom A-layer (z = -c/2)
    const bottomCenter = new THREE.Vector3(0, 0, -cHalf);
    const bottomRing = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        bottomRing.push(new THREE.Vector3(aParam * Math.cos(angle), aParam * Math.sin(angle), -cHalf));
    }
    
    // Top A-layer (z = c/2)
    const topCenter = new THREE.Vector3(0, 0, cHalf);
    const topRing = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        topRing.push(new THREE.Vector3(aParam * Math.cos(angle), aParam * Math.sin(angle), cHalf));
    }
    
    // Mid B-layer (z = 0)
    const rMid = aParam / Math.sqrt(3);
    const midAngles = [30, 150, 270];
    const midAtoms = [];
    for (let i = 0; i < 3; i++) {
        const angle = (midAngles[i] * Math.PI) / 180;
        midAtoms.push(new THREE.Vector3(rMid * Math.cos(angle), rMid * Math.sin(angle), 0));
    }
    
    // Mid B-layer ghost atoms (outside boundaries)
    const midGhosts = [
        new THREE.Vector3(0, 2 * aParam / Math.sqrt(3), 0),
        new THREE.Vector3(-aParam, -aParam / Math.sqrt(3), 0),
        new THREE.Vector3(aParam, -aParam / Math.sqrt(3), 0)
    ];
    
    // 1. Octahedral Voids (6 inside unit cell)
    if (state.voids === 'octahedral' || state.voids === 'both') {
        const octVoids = [
            { pos: new THREE.Vector3(0, aParam / Math.sqrt(3), cHalf / 2), ghost: midGhosts[0], atoms: [midAtoms[0], midAtoms[1], topCenter, topRing[1], topRing[2]] },
            { pos: new THREE.Vector3(-aParam / 2, -aParam / (2 * Math.sqrt(3)), cHalf / 2), ghost: midGhosts[1], atoms: [midAtoms[1], midAtoms[2], topCenter, topRing[3], topRing[4]] },
            { pos: new THREE.Vector3(aParam / 2, -aParam / (2 * Math.sqrt(3)), cHalf / 2), ghost: midGhosts[2], atoms: [midAtoms[0], midAtoms[2], topCenter, topRing[5], topRing[0]] },
            
            { pos: new THREE.Vector3(0, aParam / Math.sqrt(3), -cHalf / 2), ghost: midGhosts[0], atoms: [midAtoms[0], midAtoms[1], bottomCenter, bottomRing[1], bottomRing[2]] },
            { pos: new THREE.Vector3(-aParam / 2, -aParam / (2 * Math.sqrt(3)), -cHalf / 2), ghost: midGhosts[1], atoms: [midAtoms[1], midAtoms[2], bottomCenter, bottomRing[3], bottomRing[4]] },
            { pos: new THREE.Vector3(aParam / 2, -aParam / (2 * Math.sqrt(3)), -cHalf / 2), ghost: midGhosts[2], atoms: [midAtoms[0], midAtoms[2], bottomCenter, bottomRing[5], bottomRing[0]] }
        ];
        
        octVoids.forEach(ov => {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(rOct, 16, 16), materials.voidOctahedral);
            mesh.position.copy(ov.pos);
            voidsGroup.add(mesh);
            
            // Add the B-layer ghost atom for coordination completeness
            addGhostAtom(ov.ghost, atomRadius);
            
            const coordinating = [ov.ghost, ...ov.atoms];
            drawCoordinationLines(ov.pos, coordinating);
        });
    }
    
    // 2. Tetrahedral Voids (12 inside unit cell)
    if (state.voids === 'tetrahedral' || state.voids === 'both') {
        // T1 Voids: Directly above/below B-layer atoms (correct height at 3c/8 or 0.75 * cHalf)
        const t1Voids = [
            { pos: new THREE.Vector3(midAtoms[0].x, midAtoms[0].y, cHalf * 0.75), atoms: [midAtoms[0], topCenter, topRing[0], topRing[1]] },
            { pos: new THREE.Vector3(midAtoms[1].x, midAtoms[1].y, cHalf * 0.75), atoms: [midAtoms[1], topCenter, topRing[2], topRing[3]] },
            { pos: new THREE.Vector3(midAtoms[2].x, midAtoms[2].y, cHalf * 0.75), atoms: [midAtoms[2], topCenter, topRing[4], topRing[5]] },
            
            { pos: new THREE.Vector3(midAtoms[0].x, midAtoms[0].y, -cHalf * 0.75), atoms: [midAtoms[0], bottomCenter, bottomRing[0], bottomRing[1]] },
            { pos: new THREE.Vector3(midAtoms[1].x, midAtoms[1].y, -cHalf * 0.75), atoms: [midAtoms[1], bottomCenter, bottomRing[2], bottomRing[3]] },
            { pos: new THREE.Vector3(midAtoms[2].x, midAtoms[2].y, -cHalf * 0.75), atoms: [midAtoms[2], bottomCenter, bottomRing[4], bottomRing[5]] }
        ];
        
        t1Voids.forEach(tv => {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(rTet, 16, 16), materials.voidTetrahedral);
            mesh.position.copy(tv.pos);
            voidsGroup.add(mesh);
            drawCoordinationLines(tv.pos, tv.atoms);
        });
        
        // T2 Voids: Pointing sideways, completed by adjacent B-layer ghost atoms
        const t2Voids = [
            { pos: new THREE.Vector3(0, aParam / Math.sqrt(3), cHalf * 0.75), ghost: midGhosts[0], atoms: [topCenter, topRing[1], topRing[2]] },
            { pos: new THREE.Vector3(-aParam / 2, -aParam / (2 * Math.sqrt(3)), cHalf * 0.75), ghost: midGhosts[1], atoms: [topCenter, topRing[3], topRing[4]] },
            { pos: new THREE.Vector3(aParam / 2, -aParam / (2 * Math.sqrt(3)), cHalf * 0.75), ghost: midGhosts[2], atoms: [topCenter, topRing[5], topRing[0]] },
            
            { pos: new THREE.Vector3(0, aParam / Math.sqrt(3), -cHalf * 0.75), ghost: midGhosts[0], atoms: [bottomCenter, bottomRing[1], bottomRing[2]] },
            { pos: new THREE.Vector3(-aParam / 2, -aParam / (2 * Math.sqrt(3)), -cHalf * 0.75), ghost: midGhosts[1], atoms: [bottomCenter, bottomRing[3], bottomRing[4]] },
            { pos: new THREE.Vector3(aParam / 2, -aParam / (2 * Math.sqrt(3)), -cHalf * 0.75), ghost: midGhosts[2], atoms: [bottomCenter, bottomRing[5], bottomRing[0]] }
        ];
        
        t2Voids.forEach(tv => {
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(rTet, 16, 16), materials.voidTetrahedral);
            mesh.position.copy(tv.pos);
            voidsGroup.add(mesh);
            
            addGhostAtom(tv.ghost, atomRadius);
            
            const coordinating = [tv.ghost, ...tv.atoms];
            drawCoordinationLines(tv.pos, coordinating);
        });
    }
}

// Update the UI labels, descriptions, and density inputs
function updateDetailsUI() {
    let data = {};
    let badgeText = "";
    
    if (state.category === 'lattices') {
        data = LATTICE_DATA[state.model];
        badgeText = "Lattice";
        
        // Voids and planes are relevant to lattices
        document.getElementById('section-planes-control').style.display = 'block';
        document.getElementById('section-voids-control').style.display = 'block';
        
        const btnTv = document.getElementById('btn-tv');
        const btnOv = document.getElementById('btn-ov');
        const btnBoth = document.getElementById('btn-both-voids');
        const btnNone = document.getElementById('btn-none-voids');
        
        if (state.model === 'sc') {
            btnTv.innerText = "Cubic";
            btnTv.dataset.voids = "cubic";
            btnTv.style.display = "flex";
            btnOv.style.display = "none";
            btnBoth.style.display = "none";
            
            if (state.voids !== 'none' && state.voids !== 'cubic') {
                state.voids = 'none';
            }
        } else {
            btnTv.innerText = "Tetrahedral";
            btnTv.dataset.voids = "tetrahedral";
            btnTv.style.display = "flex";
            btnOv.style.display = "flex";
            btnBoth.style.display = "flex";
            
            if (state.voids === 'cubic') {
                state.voids = 'none';
            }
        }
        
        // Sync button active classes
        btnNone.classList.toggle('active', state.voids === 'none');
        btnTv.classList.toggle('active', state.voids === 'tetrahedral' || state.voids === 'cubic');
        btnOv.classList.toggle('active', state.voids === 'octahedral');
        btnBoth.classList.toggle('active', state.voids === 'both');
    } else if (state.category === 'bravais') {
        data = BRAVAIS_DATA[state.bravaisSystem];
        badgeText = "Bravais System";
        
        // Hide planes and voids for general Bravais systems
        document.getElementById('section-voids-control').style.display = 'none';
        document.getElementById('section-planes-control').style.display = 'none';
        state.voids = 'none';
        state.plane = 'none';
    } else if (state.category === 'compounds') {
        data = LATTICE_DATA[state.model];
        badgeText = "Compound";
        
        // Hide voids and planes for ionic compounds to prevent visual clutter
        document.getElementById('section-voids-control').style.display = 'none';
        document.getElementById('section-planes-control').style.display = 'none';
        state.voids = 'none';
        state.plane = 'none';
    } else if (state.category === 'defects') {
        data = LATTICE_DATA[state.model];
        badgeText = "Defect / Doping";
        
        // Hide voids and planes for defects
        document.getElementById('section-voids-control').style.display = 'none';
        document.getElementById('section-planes-control').style.display = 'none';
        state.voids = 'none';
        state.plane = 'none';
    }
    
    // Toggle card visibilities
    const densityCard = document.getElementById('density-calculator-card');
    const sandboxCard = document.getElementById('sandbox-analysis-card');
    if (state.category === 'sandbox') {
        if (densityCard) densityCard.style.display = 'none';
        if (sandboxCard) sandboxCard.style.display = 'block';
        
        // Hide planes and voids panels
        document.getElementById('section-planes-control').style.display = 'none';
        document.getElementById('section-voids-control').style.display = 'none';
        state.voids = 'none';
        state.plane = 'none';
        
        const collapseInfo = getSandboxCollapseInfo(state.sandboxSystem, state.sandboxCentering);
        const isValid = collapseInfo.isValid;
        
        const neighborsToggle = document.getElementById('sandbox-toggle-neighbors');
        if (neighborsToggle) {
            if (!isValid) {
                neighborsToggle.checked = true;
                neighborsToggle.disabled = true;
                const container = document.getElementById('sandbox-neighbors-toggle-container');
                if (container) {
                    container.style.opacity = '0.5';
                    container.style.cursor = 'not-allowed';
                }
            } else {
                neighborsToggle.checked = state.sandboxShowNeighbors;
                neighborsToggle.disabled = false;
                const container = document.getElementById('sandbox-neighbors-toggle-container');
                if (container) {
                    container.style.opacity = '1.0';
                    container.style.cursor = 'pointer';
                }
            }
        }
        
        const netZ = (state.sandboxCentering === 'primitive') ? 1 :
                     (state.sandboxCentering === 'body') ? 2 :
                     (state.sandboxCentering === 'face') ? 4 : 2; // end is 2
        
        const al = (alphaParam * Math.PI) / 180;
        const be = (betaParam * Math.PI) / 180;
        const ga = (gammaParam * Math.PI) / 180;
        const cosAlpha = Math.cos(al);
        const cosBeta = Math.cos(be);
        const cosGamma = Math.cos(ga);
        const term = 1 - cosAlpha*cosAlpha - cosBeta*cosBeta - cosGamma*cosGamma + 2*cosAlpha*cosBeta*cosGamma;
        const volume = aParam * bParam * cParam * Math.sqrt(Math.max(0, term));
        
        let minD = Infinity;
        const corners = [
            new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, 0, 1),
            new THREE.Vector3(0, 1, 1), new THREE.Vector3(1, 1, 1)
        ];
        const centeredFracs = [];
        if (state.sandboxCentering === 'body') {
            centeredFracs.push(new THREE.Vector3(0.5, 0.5, 0.5));
        } else if (state.sandboxCentering === 'face') {
            centeredFracs.push(
                new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(0.5, 0.5, 1),
                new THREE.Vector3(0.5, 0, 0.5), new THREE.Vector3(0.5, 1, 0.5),
                new THREE.Vector3(0, 0.5, 0.5), new THREE.Vector3(1, 0.5, 0.5)
            );
        } else if (state.sandboxCentering === 'end') {
            centeredFracs.push(
                new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(0.5, 0.5, 1)
            );
        }
        
        const atomFracs = corners.concat(centeredFracs);
        const atomPositions = atomFracs.map(f => fractToCart(f.x, f.y, f.z));
        for (let i = 0; i < atomPositions.length; i++) {
            for (let j = i + 1; j < atomPositions.length; j++) {
                const d = atomPositions[i].distanceTo(atomPositions[j]);
                if (d < minD && d > 0.1) {
                    minD = d;
                }
            }
        }
        
        let packingEff = "N/A";
        if (minD !== Infinity && minD > 0.1) {
            const R = minD / 2;
            const sphereVol = (4 / 3) * Math.PI * Math.pow(R, 3);
            const totalAtomVol = netZ * sphereVol;
            const eff = (totalAtomVol / volume) * 100;
            if (eff <= 100 && eff > 0) {
                packingEff = `${eff.toFixed(1)}%`;
            }
        }
        
        document.getElementById('info-title').innerText = `${capitalize(state.sandboxSystem)} ${capitalize(state.sandboxCentering === 'body' ? 'Body-Centered' : state.sandboxCentering === 'face' ? 'Face-Centered' : state.sandboxCentering === 'end' ? 'End-Centered' : 'Primitive')}`;
        
        const badgeEl = document.getElementById('info-badge');
        badgeEl.innerText = isValid ? "Stable Bravais" : "Geometry Collapses";
        badgeEl.className = isValid ? "badge stable" : "badge collapses";
        
        document.getElementById('info-description').innerHTML = isValid 
            ? `This configuration represents a stable, standard Bravais lattice for the <strong>${capitalize(state.sandboxSystem)}</strong> system.` 
            : `This configuration is unstable and collapses/reduces into a <strong>${collapseInfo.targetSystem}</strong> lattice.`;
        
        document.getElementById('stat-z').innerText = netZ.toString();
        document.getElementById('stat-efficiency').innerText = isValid ? packingEff : "Collapses";
        
        let cnText = "Collapses";
        if (isValid) {
            if (state.sandboxSystem === 'cubic') {
                cnText = (state.sandboxCentering === 'primitive') ? "6" : (state.sandboxCentering === 'body') ? "8" : "12";
            } else {
                cnText = "System Dep.";
            }
        }
        document.getElementById('stat-cn').innerText = cnText;
        
        document.getElementById('info-relation-label').innerText = "Cell Volume:";
        document.getElementById('info-formula').innerText = `${volume.toFixed(2)} Å³`;
        
        document.getElementById('sandbox-reducibility-status').innerHTML = isValid 
            ? `<span style="color: #10b981;">🟢 Stable Bravais Lattice</span>` 
            : `<span style="color: #f43f5e;">🔴 Geometry Collapses to ${collapseInfo.targetSystem}</span>`;
        document.getElementById('sandbox-reducibility-text').innerHTML = collapseInfo.explanation;
        
        const notesContainer = document.getElementById('revision-notes-list');
        if (notesContainer) {
            notesContainer.innerHTML = `
                <li>Centering types like cubic end-centered or tetragonal face-centered are redundant because they can be reduced to smaller cells of standard Bravais systems.</li>
                <li>Centering in Hexagonal and Rhombohedral systems violates rotational symmetry, forcing the system to collapse to lower symmetry monoclinic or orthorhombic lattices.</li>
                <li>Triclinic and primitive rhombohedral lattices do not have any centered variations in the 14 Bravais lattices.</li>
            `;
        }
        
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
        return;
    } else {
        if (densityCard) densityCard.style.display = 'block';
        if (sandboxCard) sandboxCard.style.display = 'none';
        document.getElementById('info-badge').className = "badge";
    }
    
    if (!data) return;
    
    // Fill text labels
    document.getElementById('info-title').innerText = data.name;
    document.getElementById('info-badge').innerText = badgeText;
    document.getElementById('info-description').innerText = data.desc;
    
    // Rank Z, Efficiency, CN
    const zElem = document.getElementById('stat-z');
    const effElem = document.getElementById('stat-efficiency');
    const cnElem = document.getElementById('stat-cn');
    const relationElem = document.getElementById('info-formula');
    
    if (state.category === 'bravais') {
        document.getElementById('info-relation-label').innerText = "Lattice Parameters:";
        
        // Calculate Z dynamically for Bravais based on variation
        let zVal = 1;
        if (state.bravaisVariation === 'body') zVal = 2;
        else if (state.bravaisVariation === 'face') zVal = 4;
        else if (state.bravaisVariation === 'end') zVal = 2;
        
        zElem.innerText = zVal;
        effElem.innerText = "N/A";
        cnElem.innerText = "Var.";
        relationElem.innerText = data.params;
        
        // Set Density Calculator default inputs
        document.getElementById('calc-m').value = "50"; // generic molar mass
        document.getElementById('calc-a').value = "300"; // generic edge length
    } else {
        // Set label dynamically based on category/model
        if (state.category === 'defects') {
            if (state.model === 'schottky' || state.model === 'frenkel') {
                document.getElementById('info-relation-label').innerText = "Density Effect:";
            } else {
                document.getElementById('info-relation-label').innerText = "Doping Scheme:";
            }
        } else {
            document.getElementById('info-relation-label').innerText = "Edge-Radius Relation:";
        }
        
        zElem.innerText = data.z;
        effElem.innerText = data.efficiency;
        cnElem.innerText = data.cn;
        relationElem.innerText = data.formula;
        
        // Pre-fill density calculator based on compound/element
        if (state.model === 'nacl' || state.model === 'schottky') {
            document.getElementById('calc-m').value = "58.5"; // NaCl (Na=23, Cl=35.5)
            document.getElementById('calc-a').value = "564";  // NaCl a = 564 pm
        } else if (state.model === 'frenkel') {
            document.getElementById('calc-m').value = "143.3"; // AgCl (Ag=107.9, Cl=35.5)
            document.getElementById('calc-a').value = "555";   // AgCl a = 555 pm
        } else if (state.model === 'cscl') {
            document.getElementById('calc-m').value = "168.4"; // CsCl (Cs=133, Cl=35.4)
            document.getElementById('calc-a').value = "412";   // CsCl a = 412 pm
        } else if (state.model === 'zns') {
            document.getElementById('calc-m').value = "97.4";  // ZnS (Zn=65.4, S=32)
            document.getElementById('calc-a').value = "541";   // ZnS a = 541 pm
        } else if (state.model === 'caf2') {
            document.getElementById('calc-m').value = "78.1";  // CaF2 (Ca=40, F=19*2)
            document.getElementById('calc-a').value = "546";   // CaF2 a = 546 pm
        } else if (state.model === 'diamond' || state.model === 'doping-n' || state.model === 'doping-p') {
            document.getElementById('calc-m').value = "12.0";  // Carbon
            document.getElementById('calc-a').value = "356";   // Diamond a = 356 pm
        } else if (state.model === 'sc') {
            document.getElementById('calc-m').value = "210";   // Polonium (only SC metal)
            document.getElementById('calc-a').value = "335";   // Polonium a = 335 pm
        } else if (state.model === 'bcc') {
            document.getElementById('calc-m').value = "55.8";  // Iron
            document.getElementById('calc-a').value = "286";   // Iron a = 286 pm
        } else if (state.model === 'fcc') {
            document.getElementById('calc-m').value = "63.5";  // Copper
            document.getElementById('calc-a').value = "361";   // Copper a = 361 pm
        } else if (state.model === 'hcp') {
            document.getElementById('calc-m').value = "24.3";  // Magnesium
            document.getElementById('calc-a').value = "321";   // Mg a = 321 pm
        }
    }
    
    // Notes list update
    const notesContainer = document.getElementById('revision-notes-list');
    notesContainer.innerHTML = "";
    data.notes.forEach(note => {
        const li = document.createElement('li');
        li.innerHTML = note;
        notesContainer.appendChild(li);
    });
    
    // Update the read-only Z input in the calculator
    document.getElementById('calc-z').value = zElem.innerText;
    
    // Recalculate density
    calculateDensity();
    
    // Trigger MathJax re-render of formulas
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

// Draw the color Legend on the bottom left
function updateLegendUI() {
    const container = document.getElementById('legend-colors');
    container.innerHTML = "";
    
    const items = [];
    
    if (state.category === 'lattices') {
        if (state.model === 'hcp') {
            items.push({ color: '#3b82f6', text: 'Metal Atom (HCP Lattice)' });
        } else {
            items.push({ color: '#3b82f6', text: 'Lattice Atom' });
        }
        
        // Voids and ghost atoms in legend
        if (state.model === 'sc' && state.voids === 'cubic') {
            items.push({ color: '#f59e0b', text: 'Cubic Void (Size ~ 0.732r)' });
        }
        if (state.model !== 'sc') {
            if (state.voids === 'tetrahedral' || state.voids === 'both') {
                items.push({ color: '#f97316', text: 'Tetrahedral Void (Size ~ 0.225r)' });
            }
            if (state.voids === 'octahedral' || state.voids === 'both') {
                items.push({ color: '#ec4899', text: 'Octahedral Void (Size ~ 0.414r)' });
            }
        }
        // If voids are active and it's BCC or HCP, show the Ghost Atom legend item!
        if (state.voids !== 'none' && (state.model === 'bcc' || state.model === 'hcp')) {
            items.push({ color: 'rgba(59, 130, 246, 0.35)', text: 'Ghost Atom (Adjacent Cell)' });
        }
    } else if (state.category === 'bravais') {
        items.push({ color: '#3b82f6', text: 'Lattice Node / Atom' });
    } else if (state.category === 'compounds') {
        if (state.model === 'nacl') {
            items.push({ color: '#10b981', text: 'Chloride Ion (Cl⁻)' });
            items.push({ color: '#3b82f6', text: 'Sodium Ion (Na⁺)' });
        } else if (state.model === 'cscl') {
            items.push({ color: '#10b981', text: 'Chloride Ion (Cl⁻)' });
            items.push({ color: '#8b5cf6', text: 'Cesium Ion (Cs⁺)' });
        } else if (state.model === 'zns') {
            items.push({ color: '#eab308', text: 'Sulfide Ion (S²⁻)' });
            items.push({ color: '#64748b', text: 'Zinc Ion (Zn²⁺)' });
        } else if (state.model === 'caf2') {
            items.push({ color: '#3b82f6', text: 'Calcium Ion (Ca²⁺)' });
            items.push({ color: '#f97316', text: 'Fluoride Ion (F⁻)' });
        } else if (state.model === 'diamond') {
            items.push({ color: '#4b5563', text: 'Carbon Atom (sp³ C)' });
        }
    } else if (state.category === 'defects') {
        if (state.model === 'schottky') {
            items.push({ color: '#10b981', text: 'Chloride Ion (Cl⁻)' });
            items.push({ color: '#3b82f6', text: 'Sodium Ion (Na⁺)' });
            items.push({ color: '#ef4444', text: 'Missing Ion Vacancy (Dashed)' });
        } else if (state.model === 'frenkel') {
            items.push({ color: '#10b981', text: 'Chloride Ion (Cl⁻)' });
            items.push({ color: '#3b82f6', text: 'Silver Ion (Ag⁺)' });
            items.push({ color: '#ef4444', text: 'Cation Vacancy Site' });
            items.push({ color: '#3b82f6', text: 'Interstitial Cation (Ag⁺)' });
        } else if (state.model === 'doping-n') {
            items.push({ color: '#4b5563', text: 'Carbon Atom' });
            items.push({ color: '#f97316', text: 'Phosphorus Dopant (P)' });
            items.push({ color: '#60a5fa', text: 'Free Conduction Electron (e⁻)' });
        } else if (state.model === 'doping-p') {
            items.push({ color: '#4b5563', text: 'Carbon Atom' });
            items.push({ color: '#a78bfa', text: 'Boron Dopant (B)' });
            items.push({ color: '#a78bfa', text: 'Electron Vacancy Hole (Dashed)' });
        }
    } else if (state.category === 'sandbox') {
        const collapseInfo = getSandboxCollapseInfo(state.sandboxSystem, state.sandboxCentering);
        const isValid = collapseInfo.isValid;
        
        items.push({ color: '#3b82f6', text: 'Corner / Lattice Atoms' });
        if (state.sandboxCentering !== 'primitive') {
            if (isValid) {
                items.push({ color: '#3b82f6', text: 'Centered Atoms' });
            } else {
                items.push({ color: '#ef4444', text: 'Collapse-Causing Atoms' });
                items.push({ color: 'rgba(59, 130, 246, 0.4)', text: 'Ghost Corner Atoms' });
                items.push({ color: 'rgba(239, 68, 68, 0.4)', text: 'Ghost Centering Atoms' });
            }
        }
    }
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = "legend-item";
        div.innerHTML = `<span class="legend-dot" style="background: ${item.color};"></span> ${item.text}`;
        container.appendChild(div);
    });
}

// Calculate crystal density using formula: d = (Z * M) / (Na * a^3)
function calculateDensity() {
    let zVal = parseFloat(document.getElementById('calc-z').value) || 1;
    let mVal = parseFloat(document.getElementById('calc-m').value) || 58.5;
    let aPm = parseFloat(document.getElementById('calc-a').value) || 564;
    
    // a in pm. 1 pm = 10^-10 cm. 
    // a^3 in cm^3 = (a * 10^-10)^3 = a^3 * 10^-30 cm^3
    // Avogadro Constant Na = 6.022 * 10^23
    // d = (Z * M) / (Na * a^3 * 10^-30) = (Z * M * 10^7) / (6.022 * a^3)
    
    if (aPm <= 0) return;
    
    const density = (zVal * mVal * 1e7) / (6.02214 * Math.pow(aPm, 3));
    
    document.getElementById('calc-density-val').innerText = `${density.toFixed(2)} g/cm³`;
}

// Populate the Bravais Lattice variation buttons based on selected system
function updateBravaisVariationButtons() {
    const system = state.bravaisSystem;
    const data = BRAVAIS_DATA[system];
    const container = document.getElementById('bravais-variation-buttons');
    container.innerHTML = "";
    
    data.variations.forEach((varType, index) => {
        const btn = document.createElement('button');
        btn.className = "select-btn";
        if (index === 0) {
            btn.classList.add('active');
            state.bravaisVariation = varType;
        }
        btn.dataset.variation = varType;
        
        let label = "Primitive (P)";
        if (varType === 'body') label = "Body-Centered (I)";
        else if (varType === 'face') label = "Face-Centered (F)";
        else if (varType === 'end') label = "End-Centered (C)";
        
        btn.innerText = label;
        container.appendChild(btn);
        
        // Add click event for dynamic variations
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#bravais-variation-buttons .select-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.bravaisVariation = varType;
            updateModel();
        });
    });
}

// Bind interactive event listeners to all DOM controls
function bindUIEvents() {
    // Navigation Category Tabs
    document.querySelectorAll('.category-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.category = btn.dataset.category;
            
            // Update showing section
            document.querySelectorAll('.control-group').forEach(group => group.classList.remove('active'));
            
            if (state.category === 'lattices') {
                document.getElementById('section-lattices').classList.add('active');
                const activeSub = document.querySelector('#section-lattices .select-btn.active');
                if (activeSub) state.model = activeSub.dataset.model;
            } else if (state.category === 'bravais') {
                document.getElementById('section-bravais').classList.add('active');
                updateBravaisVariationButtons();
            } else if (state.category === 'compounds') {
                document.getElementById('section-compounds').classList.add('active');
                const activeSub = document.querySelector('#section-compounds .select-btn.active');
                if (activeSub) state.model = activeSub.dataset.model;
            } else if (state.category === 'defects') {
                document.getElementById('section-defects').classList.add('active');
                const activeSub = document.querySelector('#section-defects .select-btn.active');
                if (activeSub) state.model = activeSub.dataset.model;
            } else if (state.category === 'sandbox') {
                document.getElementById('section-sandbox').classList.add('active');
            }
            
            updateModel();
        });
    });

    // Sub-selector buttons for lattices, compounds & defects
    document.querySelectorAll('#section-lattices .select-btn, #section-compounds .select-btn, #section-defects .select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.parentElement;
            parent.querySelectorAll('.select-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.model = btn.dataset.model;
            updateModel();
        });
    });

    // Bravais System dropdown change
    document.getElementById('bravais-system-select').addEventListener('change', (e) => {
        state.bravaisSystem = e.target.value;
        updateBravaisVariationButtons();
        updateModel();
    });

    // Display Style segmented control
    document.querySelectorAll('[data-style]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.style = btn.dataset.style;
            updateModel();
        });
    });

    // Bounds toggle
    document.getElementById('toggle-bounds').addEventListener('change', (e) => {
        state.showBounds = e.target.checked;
        updateModel();
    });

    // Cut Spheres clipping toggle
    document.getElementById('toggle-cut-spheres').addEventListener('change', (e) => {
        state.cutSpheres = e.target.checked;
        updateModel();
    });

    // Auto rotate toggle
    document.getElementById('toggle-rotate').addEventListener('change', (e) => {
        state.autoRotate = e.target.checked;
    });

    // Highlight voids control
    document.querySelectorAll('[data-voids]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-voids]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.voids = btn.dataset.voids;
            updateModel();
        });
    });

    // Helper to toggle visibility of custom Miller index inputs
    function updateCustomPlaneInputVisibility() {
        const container = document.getElementById('custom-hkl-inputs');
        if (state.plane === 'custom') {
            container.style.display = 'flex';
        } else {
            container.style.display = 'none';
        }
    }
    
    // Hide initially
    updateCustomPlaneInputVisibility();

    // Slicing plane control
    document.querySelectorAll('[data-plane]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-plane]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.plane = btn.dataset.plane;
            updateCustomPlaneInputVisibility();
            updateModel();
        });
    });

    // Custom Plane h, k, l input changes
    document.getElementById('plane-h').addEventListener('input', updateModel);
    document.getElementById('plane-k').addEventListener('input', updateModel);
    document.getElementById('plane-l').addEventListener('input', updateModel);

    // Density Calculator Inputs
    document.getElementById('calc-m').addEventListener('input', calculateDensity);
    document.getElementById('calc-a').addEventListener('input', calculateDensity);

    // Resize Handler
    window.addEventListener('resize', onWindowResize);

    // Toggle tooltip on click/touch for mobile and better interactivity
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.addEventListener('click', (e) => {
            e.stopPropagation();
            tooltip.classList.toggle('active');
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.tooltip').forEach(tooltip => {
            tooltip.classList.remove('active');
        });
    });

    // Sandbox Crystal System Buttons
    document.querySelectorAll('#sandbox-system-buttons .sandbox-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#sandbox-system-buttons .sandbox-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.sandboxSystem = btn.dataset.system;
            updateModel();
        });
    });

    // Sandbox Centering Buttons
    document.querySelectorAll('#sandbox-centering-buttons .sandbox-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#sandbox-centering-buttons .sandbox-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.sandboxCentering = btn.dataset.centering;
            updateModel();
        });
    });

    // Sandbox Neighbors Toggle
    const neighborsToggle = document.getElementById('sandbox-toggle-neighbors');
    if (neighborsToggle) {
        neighborsToggle.addEventListener('change', (e) => {
            state.sandboxShowNeighbors = e.target.checked;
            updateModel();
        });
    }

    // Floating Auto-Rotate Button Click
    const floatRotateBtn = document.getElementById('floating-rotate-btn');
    if (floatRotateBtn) {
        floatRotateBtn.addEventListener('click', (e) => {
            toggleAutoRotate();
        });
    }

    // Spacebar Key Shortcut to Toggle Auto-Rotate
    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
            return;
        }
        if (e.code === 'Space') {
            e.preventDefault();
            toggleAutoRotate();
        }
    });

    // Mouse click coordinate recorder and raycast color picker trigger
    let pointerDownX = 0, pointerDownY = 0;
    if (renderer && renderer.domElement) {
        renderer.domElement.addEventListener('pointerdown', (e) => {
            pointerDownX = e.clientX;
            pointerDownY = e.clientY;
        });
        
        renderer.domElement.addEventListener('pointerup', (e) => {
            const deltaX = Math.abs(e.clientX - pointerDownX);
            const deltaY = Math.abs(e.clientY - pointerDownY);
            // Click threshold is 5 pixels
            if (deltaX < 5 && deltaY < 5) {
                handleCanvasClick(e);
            }
        });
    }

    // Color Dot Option Picker Clicks
    document.querySelectorAll('.color-dot-option').forEach(dot => {
        dot.addEventListener('click', (e) => {
            if (selectedMeshForColoring) {
                const hexColor = dot.dataset.color;
                selectedMeshForColoring.material = selectedMeshForColoring.material.clone();
                selectedMeshForColoring.material.color.set(hexColor);
                // Keep nice physical rendering properties
                selectedMeshForColoring.material.roughness = 0.15;
                selectedMeshForColoring.material.metalness = 0.1;
                hideColorPicker();
            }
        });
    });
}

// Window resize handler
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Rendering Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Auto Rotation if enabled and not currently interacting
    if (state.autoRotate && !isInteracting) {
        atomsGroup.rotation.y += 0.003;
        bondsGroup.rotation.y += 0.003;
        boundsGroup.rotation.y += 0.003;
        voidsGroup.rotation.y += 0.003;
        planesGroup.rotation.y += 0.003;
    }
    
    // Animate free electron orbit
    if (freeElectronMesh) {
        electronAngle += 0.05;
        const x = electronOrbitRadius * Math.cos(electronAngle);
        const y = electronOrbitRadius * Math.sin(electronAngle) * 0.5;
        const z = electronOrbitRadius * Math.sin(electronAngle) * 0.866;
        freeElectronMesh.position.copy(freeElectronCenter).add(new THREE.Vector3(x, y, z));
    }
    
    // Animate hole pulsing
    if (holePulsingMesh) {
        holePulseTime += 0.05;
        const scale = 1.0 + 0.15 * Math.sin(holePulseTime);
        holePulsingMesh.scale.set(scale, scale, scale);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Sandbox Helper Functions

function getSandboxCollapseInfo(system, centering) {
    const key = `${system}-${centering}`;
    switch (key) {
        // Cubic Cases
        case 'cubic-primitive':
            return {
                isValid: true,
                targetSystem: 'Cubic Primitive (P)',
                explanation: 'Standard Bravais lattice. Lattice points are located only at the corners.'
            };
        case 'cubic-body':
            return {
                isValid: true,
                targetSystem: 'Cubic Body-Centered (I)',
                explanation: 'Standard Bravais lattice. Lattice points are located at the corners and at the exact center of the body.'
            };
        case 'cubic-face':
            return {
                isValid: true,
                targetSystem: 'Cubic Face-Centered (F)',
                explanation: 'Standard Bravais lattice. Lattice points are located at the corners and at the centers of all six faces.'
            };
        case 'cubic-end':
            return {
                isValid: false,
                targetSystem: 'Tetragonal Primitive (P)',
                explanation: '<strong>End-centering a Cubic system collapses it to Tetragonal Primitive!</strong><br>Adding end-centers (on Z-faces) breaks the cubic 3-fold body diagonal symmetry, making the vertical c-axis unique. By choosing a smaller unit cell rotated by 45° in the XY plane, we define a smaller <strong>Tetragonal Primitive (P)</strong> lattice with half the volume ($a\' = a/\\sqrt{2}, c\' = a$).'
            };

        // Tetragonal Cases
        case 'tetragonal-primitive':
            return {
                isValid: true,
                targetSystem: 'Tetragonal Primitive (P)',
                explanation: 'Standard Bravais lattice. Lattice points are at corners, with $a = b \\neq c$ and all angles at 90°.'
            };
        case 'tetragonal-body':
            return {
                isValid: true,
                targetSystem: 'Tetragonal Body-Centered (I)',
                explanation: 'Standard Bravais lattice. Lattice points are at corners and the body center.'
            };
        case 'tetragonal-face':
            return {
                isValid: false,
                targetSystem: 'Tetragonal Body-Centered (I)',
                explanation: '<strong>Tetragonal Face-Centered (F) is redundant and collapses to Tetragonal Body-Centered (I)!</strong><br>By selecting a smaller unit cell rotated 45° in the XY plane ($a\' = a/\\sqrt{2}, c\' = c$), we can define a smaller unit cell with half the volume that is <strong>Body-Centered (I)</strong>. Hence, Tetragonal F is crystallographically redundant.'
            };
        case 'tetragonal-end':
            return {
                isValid: false,
                targetSystem: 'Tetragonal Primitive (P)',
                explanation: '<strong>Tetragonal End-Centered (C) is redundant and collapses to Tetragonal Primitive (P)!</strong><br>Placing end-centered atoms on the Z-faces allows us to choose a smaller unit cell rotated 45° in the XY plane ($a\' = a/\\sqrt{2}, c\' = c$). This smaller cell has half the volume and contains only corner atoms, making it <strong>Tetragonal Primitive (P)</strong>.'
            };

        // Orthorhombic Cases
        case 'orthorhombic-primitive':
            return {
                isValid: true,
                targetSystem: 'Orthorhombic Primitive (P)',
                explanation: 'Standard Bravais lattice. Lattice points only at corners, with $a \\neq b \\neq c$ and all angles at 90°.'
            };
        case 'orthorhombic-body':
            return {
                isValid: true,
                targetSystem: 'Orthorhombic Body-Centered (I)',
                explanation: 'Standard Bravais lattice. Lattice points at corners and body center.'
            };
        case 'orthorhombic-face':
            return {
                isValid: true,
                targetSystem: 'Orthorhombic Face-Centered (F)',
                explanation: 'Standard Bravais lattice. Lattice points at corners and all six face centers.'
            };
        case 'orthorhombic-end':
            return {
                isValid: true,
                targetSystem: 'Orthorhombic End-Centered (C)',
                explanation: 'Standard Bravais lattice. Lattice points at corners and the Z-face centers.'
            };

        // Hexagonal Cases
        case 'hexagonal-primitive':
            return {
                isValid: true,
                targetSystem: 'Hexagonal Primitive (P)',
                explanation: 'Standard Bravais lattice. Hexagonal system only has a primitive Bravais lattice with $a = b \\neq c$, $\\alpha = \\beta = 90^\\circ, \\gamma = 120^\\circ$.'
            };
        case 'hexagonal-body':
            return {
                isValid: false,
                targetSystem: 'Orthorhombic',
                explanation: '<strong>Hexagonal Body-Centered (I) violates rotational symmetry!</strong><br>Adding a body-center atom breaks the 6-fold (and 3-fold) rotational axis of the hexagonal prism. This destroys the hexagonal system, collapsing the geometry to the lower-symmetry <strong>Orthorhombic</strong> system.'
            };
        case 'hexagonal-face':
            return {
                isValid: false,
                targetSystem: 'Orthorhombic',
                explanation: '<strong>Hexagonal Face-Centered (F) violates rotational symmetry!</strong><br>Adding face-center atoms breaks the 6-fold rotational symmetry along the c-axis, collapsing the crystal system to a lower-symmetry <strong>Orthorhombic</strong> system.'
            };
        case 'hexagonal-end':
            return {
                isValid: false,
                targetSystem: 'Orthorhombic',
                explanation: '<strong>Hexagonal End-Centered (C) violates rotational symmetry!</strong><br>Placing end-centered atoms on the Z-faces breaks the 6-fold rotational axis. The hexagonal prism symmetry collapses into a lower-symmetry <strong>Orthorhombic</strong> system (since a hexagonal base can be represented as an orthorhombic C-centered lattice with $b = a\\sqrt{3}$).'
            };

        // Rhombohedral Cases
        case 'rhombohedral-primitive':
            return {
                isValid: true,
                targetSystem: 'Rhombohedral Primitive (P)',
                explanation: 'Standard Bravais lattice (often denoted as R). The cell is a stretched cube along its body diagonal: $a = b = c, \\alpha = \\beta = \\gamma \\neq 90^\\circ$.'
            };
        case 'rhombohedral-body':
            return {
                isValid: false,
                targetSystem: 'Monoclinic',
                explanation: '<strong>Rhombohedral Body-Centered (I) violates 3-fold symmetry!</strong><br>Adding a body-center atom destroys the 3-fold rotational axis along the main body diagonal. The symmetry collapses to the lower-symmetry <strong>Monoclinic</strong> system.'
            };
        case 'rhombohedral-face':
            return {
                isValid: false,
                targetSystem: 'Triclinic',
                explanation: '<strong>Rhombohedral Face-Centered (F) collapses to Triclinic!</strong><br>Adding face-centers to the rhombohedral cell breaks all mirror planes and rotational axes. The geometry collapses to the lowest-symmetry <strong>Triclinic</strong> system.'
            };
        case 'rhombohedral-end':
            return {
                isValid: false,
                targetSystem: 'Monoclinic',
                explanation: '<strong>Rhombohedral End-Centered (C) collapses to Monoclinic!</strong><br>Placing end-centered atoms on one pair of opposite faces breaks the 3-fold diagonal rotational symmetry. The lattice collapses into the lower-symmetry <strong>Monoclinic</strong> system.'
            };

        // Monoclinic Cases
        case 'monoclinic-primitive':
            return {
                isValid: true,
                targetSystem: 'Monoclinic Primitive (P)',
                explanation: 'Standard Bravais lattice. $a \\neq b \\neq c$, $\\alpha = \\gamma = 90^\\circ \\neq \\beta$.'
            };
        case 'monoclinic-body':
            return {
                isValid: false,
                targetSystem: 'Monoclinic End-Centered (C)',
                explanation: '<strong>Monoclinic Body-Centered (I) is redundant and reduces to Monoclinic End-Centered (C)!</strong><br>A monoclinic body-centered lattice can be transformed into a monoclinic end-centered (C) lattice by choosing a new set of basis vectors in the XZ plane. Hence, it is redundant.'
            };
        case 'monoclinic-face':
            return {
                isValid: false,
                targetSystem: 'Monoclinic End-Centered (C)',
                explanation: '<strong>Monoclinic Face-Centered (F) is redundant and reduces to Monoclinic End-Centered (C)!</strong><br>Adding all face centers allows us to choose a smaller monoclinic cell with half the volume that is <strong>End-Centered (C)</strong>. Thus, Monoclinic F is redundant.'
            };
        case 'monoclinic-end':
            return {
                isValid: true,
                targetSystem: 'Monoclinic End-Centered (C)',
                explanation: 'Standard Bravais lattice. Lattice points are at corners and the Z-face centers.'
            };

        // Triclinic Cases
        case 'triclinic-primitive':
            return {
                isValid: true,
                targetSystem: 'Triclinic Primitive (P)',
                explanation: 'Standard Bravais lattice. The lowest symmetry system with $a \\neq b \\neq c$ and $\\alpha \\neq \\beta \\neq \\gamma \\neq 90^\\circ$.'
            };
        case 'triclinic-body':
            return {
                isValid: false,
                targetSystem: 'Triclinic Primitive (P)',
                explanation: '<strong>Triclinic Body-Centered (I) collapses to Triclinic Primitive (P)!</strong><br>Since a triclinic lattice has no symmetry constraints, any centering can always be reduced to a smaller, primitive triclinic cell with half the volume by choosing new translation vectors.'
            };
        case 'triclinic-face':
            return {
                isValid: false,
                targetSystem: 'Triclinic Primitive (P)',
                explanation: '<strong>Triclinic Face-Centered (F) collapses to Triclinic Primitive (P)!</strong><br>Any face-centered triclinic lattice can be reduced to a smaller, primitive triclinic cell with 1/4 the volume by choosing a different primitive basis.'
            };
        case 'triclinic-end':
            return {
                isValid: false,
                targetSystem: 'Triclinic Primitive (P)',
                explanation: '<strong>Triclinic End-Centered (C) collapses to Triclinic Primitive (P)!</strong><br>Any end-centered triclinic lattice can be reduced to a smaller, primitive triclinic cell with half the volume.'
            };

        default:
            return { isValid: true, targetSystem: '', explanation: '' };
    }
}

function drawGhostBounds(shift) {
    const points = [];
    const corners = [];
    for (let x = 0; x <= 1; x++) {
        for (let y = 0; y <= 1; y++) {
            for (let z = 0; z <= 1; z++) {
                // clone the converted cartesian point, shift it, and store
                corners.push(fractToCart(x, y, z).add(shift));
            }
        }
    }
    // Edges along x direction
    points.push(corners[0], corners[4]);
    points.push(corners[1], corners[5]);
    points.push(corners[2], corners[6]);
    points.push(corners[3], corners[7]);
    // Edges along y direction
    points.push(corners[0], corners[2]);
    points.push(corners[1], corners[3]);
    points.push(corners[4], corners[6]);
    points.push(corners[5], corners[7]);
    // Edges along z direction
    points.push(corners[0], corners[1]);
    points.push(corners[2], corners[3]);
    points.push(corners[4], corners[5]);
    points.push(corners[6], corners[7]);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.LineSegments(geometry, materials.boundsGhost);
    boundsGroup.add(line);
}

function drawSandboxModel() {
    const collapseInfo = getSandboxCollapseInfo(state.sandboxSystem, state.sandboxCentering);
    const isValid = collapseInfo.isValid;
    
    // Corners
    const corners = [
        new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(1, 1, 0), new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(0, 1, 1), new THREE.Vector3(1, 1, 1)
    ];
    
    let atomRadius = 0.45;
    if (state.style === 'space-fill') {
        const sys = state.sandboxSystem;
        if (sys === 'cubic') atomRadius = 0.5;
        else if (sys === 'tetragonal') atomRadius = 0.45;
        else if (sys === 'orthorhombic') atomRadius = 0.4;
        else if (sys === 'hexagonal') atomRadius = 0.45;
        else if (sys === 'rhombohedral') atomRadius = 0.45;
        else if (sys === 'monoclinic') atomRadius = 0.4;
        else atomRadius = 0.4;
    }
    
    const mainAtomsData = [];
    
    // Add corners to main
    corners.forEach(frac => {
        mainAtomsData.push({
            pos: fractToCart(frac.x, frac.y, frac.z),
            material: materials.cation,
            r: atomRadius
        });
    });
    
    // Centering fractions
    const centeredFracs = [];
    if (state.sandboxCentering === 'body') {
        centeredFracs.push(new THREE.Vector3(0.5, 0.5, 0.5));
    } else if (state.sandboxCentering === 'face') {
        centeredFracs.push(
            new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(0.5, 0.5, 1), // Z
            new THREE.Vector3(0.5, 0, 0.5), new THREE.Vector3(0.5, 1, 0.5), // Y
            new THREE.Vector3(0, 0.5, 0.5), new THREE.Vector3(1, 0.5, 0.5)  // X
        );
    } else if (state.sandboxCentering === 'end') {
        centeredFracs.push(
            new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(0.5, 0.5, 1)  // Z
        );
    }
    
    const centeringMaterial = isValid ? materials.cation : materials.collapseAtom;
    
    centeredFracs.forEach(frac => {
        mainAtomsData.push({
            pos: fractToCart(frac.x, frac.y, frac.z),
            material: centeringMaterial,
            r: atomRadius
        });
    });
    
    // Render main atoms
    mainAtomsData.forEach(atom => {
        addAtom(atom.pos, atom.material, atom.r);
    });
    
    // Main bonds
    if (state.style === 'ball-stick') {
        let minD = Infinity;
        for (let i = 0; i < mainAtomsData.length; i++) {
            for (let j = i + 1; j < mainAtomsData.length; j++) {
                const d = mainAtomsData[i].pos.distanceTo(mainAtomsData[j].pos);
                if (d < minD && d > 0.1) {
                    minD = d;
                }
            }
        }
        if (minD !== Infinity && minD > 0.2) {
            generateBonds(mainAtomsData, minD - 0.15, minD + 0.15);
        }
    }
    
    // Draw 6 neighbors if collapsing or if show neighbors is toggled
    const showNeighbors = !isValid || state.sandboxShowNeighbors;
    if (showNeighbors) {
        const shifts = [
            uA.clone(),
            uA.clone().negate(),
            uB.clone(),
            uB.clone().negate(),
            uC.clone(),
            uC.clone().negate()
        ];
        
        shifts.forEach(shift => {
            drawGhostBounds(shift);
            
            // Ghost corners
            corners.forEach(frac => {
                const pos = fractToCart(frac.x, frac.y, frac.z).add(shift);
                const geom = new THREE.SphereGeometry(atomRadius, 16, 16);
                const mesh = new THREE.Mesh(geom, materials.ghostAtom);
                mesh.position.copy(pos);
                atomsGroup.add(mesh);
            });
            
            // Ghost centering atoms
            const ghostCenteringMat = isValid ? materials.ghostAtom : materials.collapseAtomGhost;
            centeredFracs.forEach(frac => {
                const pos = fractToCart(frac.x, frac.y, frac.z).add(shift);
                const geom = new THREE.SphereGeometry(atomRadius, 16, 16);
                const mesh = new THREE.Mesh(geom, ghostCenteringMat);
                mesh.position.copy(pos);
                atomsGroup.add(mesh);
            });
        });
    }
    
    // Draw collapsed outline if collapsing
    if (!isValid) {
        drawCollapsedOutline(state.sandboxSystem, state.sandboxCentering);
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Drawing collapsed outline
function drawCollapsedOutline(system, centering) {
    const key = `${system}-${centering}`;
    let vertices = [];
    let edges = [];
    
    switch (key) {
        // Cubic, Tetragonal, Rhombohedral, and Triclinic Z-Face End-Centered Cases
        case 'cubic-end':
        case 'tetragonal-end':
        case 'rhombohedral-end':
        case 'triclinic-end':
            // Collapses/Reduces to primitive of half volume (rotated 45 deg in XY plane)
            vertices = [
                new THREE.Vector3(0.5, 0.5, 0),   // 0
                new THREE.Vector3(1, 0, 0),       // 1
                new THREE.Vector3(0.5, -0.5, 0),  // 2
                new THREE.Vector3(0, 0, 0),       // 3
                new THREE.Vector3(0.5, 0.5, 1),   // 4
                new THREE.Vector3(1, 0, 1),       // 5
                new THREE.Vector3(0.5, -0.5, 1),  // 6
                new THREE.Vector3(0, 0, 1)        // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            break;

        case 'monoclinic-body':
            // Collapses/Reduces to Monoclinic End-Centered (C) of same volume (basis: a, b, a+c)
            vertices = [
                new THREE.Vector3(0, 0, 0),       // 0
                new THREE.Vector3(1, 0, 0),       // 1
                new THREE.Vector3(1, 1, 0),       // 2
                new THREE.Vector3(0, 1, 0),       // 3
                new THREE.Vector3(1, 0, 1),       // 4
                new THREE.Vector3(2, 0, 1),       // 5
                new THREE.Vector3(2, 1, 1),       // 6
                new THREE.Vector3(1, 1, 1)        // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            // Base centering diagonals on XZ-skewed face 1 (0, 3, 7, 4) centered at body center (0.5, 0.5, 0.5)
            const mcBodyCenter1 = new THREE.Vector3(0.5, 0.5, 0.5);
            [0, 3, 7, 4].forEach(i => {
                drawCylinderLine(fractToCart(mcBodyCenter1.x, mcBodyCenter1.y, mcBodyCenter1.z), fractToCart(vertices[i].x, vertices[i].y, vertices[i].z), 0x00f0ff, 0.012);
            });
            // Base centering diagonals on opposite XZ-skewed face 2 (1, 2, 6, 5) centered at (1.5, 0.5, 0.5)
            const mcBodyCenter2 = new THREE.Vector3(1.5, 0.5, 0.5);
            [1, 2, 6, 5].forEach(i => {
                drawCylinderLine(fractToCart(mcBodyCenter2.x, mcBodyCenter2.y, mcBodyCenter2.z), fractToCart(vertices[i].x, vertices[i].y, vertices[i].z), 0x00f0ff, 0.012);
            });
            break;

        case 'monoclinic-face':
            // Collapses/Reduces to Monoclinic End-Centered (C) of half volume (basis: 1/2(a+c), b, a)
            vertices = [
                new THREE.Vector3(0, 0, 0),         // 0
                new THREE.Vector3(1, 0, 0),         // 1
                new THREE.Vector3(1, 1, 0),         // 2
                new THREE.Vector3(0, 1, 0),         // 3
                new THREE.Vector3(0.5, 0, 0.5),     // 4
                new THREE.Vector3(1.5, 0, 0.5),     // 5
                new THREE.Vector3(1.5, 1, 0.5),     // 6
                new THREE.Vector3(0.5, 1, 0.5)      // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            // Base centering diagonals on XY face (0, 1, 2, 3) centered at (0.5, 0.5, 0)
            const mcFaceCenter1 = new THREE.Vector3(0.5, 0.5, 0);
            [0, 1, 2, 3].forEach(i => {
                drawCylinderLine(fractToCart(mcFaceCenter1.x, mcFaceCenter1.y, mcFaceCenter1.z), fractToCart(vertices[i].x, vertices[i].y, vertices[i].z), 0x00f0ff, 0.012);
            });
            // Base centering diagonals on opposite XY face (4, 5, 6, 7) centered at (1.0, 0.5, 0.5)
            const mcFaceCenter2 = new THREE.Vector3(1.0, 0.5, 0.5);
            [4, 5, 6, 7].forEach(i => {
                drawCylinderLine(fractToCart(mcFaceCenter2.x, mcFaceCenter2.y, mcFaceCenter2.z), fractToCart(vertices[i].x, vertices[i].y, vertices[i].z), 0x00f0ff, 0.012);
            });
            break;

        case 'triclinic-body':
            // Collapses/Reduces to Triclinic Primitive (P) of half volume (basis: a, b, 1/2(a+b+c))
            vertices = [
                new THREE.Vector3(0, 0, 0),         // 0
                new THREE.Vector3(1, 0, 0),         // 1
                new THREE.Vector3(1, 1, 0),         // 2
                new THREE.Vector3(0, 1, 0),         // 3
                new THREE.Vector3(0.5, 0.5, 0.5),   // 4
                new THREE.Vector3(1.5, 0.5, 0.5),   // 5
                new THREE.Vector3(1.5, 1.5, 0.5),   // 6
                new THREE.Vector3(0.5, 1.5, 0.5)    // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            break;

        case 'triclinic-face':
            // Collapses/Reduces to Triclinic Primitive (P) of quarter volume (basis: 1/2(a+b), 1/2(b+c), 1/2(a+c))
            vertices = [
                new THREE.Vector3(0, 0, 0),         // 0
                new THREE.Vector3(0.5, 0.5, 0),     // 1
                new THREE.Vector3(0.5, 1.0, 0.5),   // 2
                new THREE.Vector3(0, 0.5, 0.5),     // 3
                new THREE.Vector3(0.5, 0, 0.5),     // 4
                new THREE.Vector3(1.0, 0.5, 0.5),   // 5
                new THREE.Vector3(1.0, 1.0, 1.0),   // 6
                new THREE.Vector3(0.5, 0.5, 1.0)    // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            break;
            
        case 'tetragonal-face':
            // Collapses to Tetragonal Body-Centered (I) of half volume
            vertices = [
                new THREE.Vector3(0.5, 0.5, 0),   // 0
                new THREE.Vector3(1, 0, 0),       // 1
                new THREE.Vector3(0.5, -0.5, 0),  // 2
                new THREE.Vector3(0, 0, 0),       // 3
                new THREE.Vector3(0.5, 0.5, 1),   // 4
                new THREE.Vector3(1, 0, 1),       // 5
                new THREE.Vector3(0.5, -0.5, 1),  // 6
                new THREE.Vector3(0, 0, 1)        // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            // Body-centered helper lines connecting (0.5, 0, 0.5) to the 8 corners of the new cell
            const bodyCenter = new THREE.Vector3(0.5, 0, 0.5);
            for (let i = 0; i < 8; i++) {
                drawCylinderLine(fractToCart(bodyCenter.x, bodyCenter.y, bodyCenter.z), fractToCart(vertices[i].x, vertices[i].y, vertices[i].z), 0x00f0ff, 0.012);
            }
            break;
            
        case 'hexagonal-body':
        case 'hexagonal-face':
        case 'hexagonal-end':
            // Collapses to Orthorhombic cell
            vertices = [
                new THREE.Vector3(0, 0, 0),     // 0
                new THREE.Vector3(1, 1, 0),     // 1
                new THREE.Vector3(2, 0, 0),     // 2
                new THREE.Vector3(1, -1, 0),    // 3
                new THREE.Vector3(0, 0, 1),     // 4
                new THREE.Vector3(1, 1, 1),     // 5
                new THREE.Vector3(2, 0, 1),     // 6
                new THREE.Vector3(1, -1, 1)     // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            break;
            
        case 'rhombohedral-body':
            // Collapses to Monoclinic of half volume by choosing a cell connecting corner to body center layer
            vertices = [
                new THREE.Vector3(0, 0, 0),       // 0
                new THREE.Vector3(1, 0, 0),       // 1
                new THREE.Vector3(1, 1, 0),       // 2
                new THREE.Vector3(0, 1, 0),       // 3
                new THREE.Vector3(0.5, 0.5, 0.5), // 4
                new THREE.Vector3(1.5, 0.5, 0.5), // 5
                new THREE.Vector3(1.5, 1.5, 0.5), // 6
                new THREE.Vector3(0.5, 1.5, 0.5)  // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            break;
            
        case 'rhombohedral-face':
            // Collapses to Triclinic
            vertices = [
                new THREE.Vector3(0.5, 0.5, 0),   // 0
                new THREE.Vector3(1, 0, 0),       // 1
                new THREE.Vector3(0.5, -0.5, 0),  // 2
                new THREE.Vector3(0, 0, 0),       // 3
                new THREE.Vector3(0.5, 0, 0.5),   // 4
                new THREE.Vector3(1, -0.5, 0.5),  // 5
                new THREE.Vector3(0.5, -1, 0.5),  // 6
                new THREE.Vector3(0, -0.5, 0.5)   // 7
            ];
            edges = [
                [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
                [4, 5], [5, 6], [6, 7], [7, 4], // Top
                [0, 4], [1, 5], [2, 6], [3, 7]  // Verticals
            ];
            break;
    }
    
    // Draw all edges as cyan cylinders
    edges.forEach(edge => {
        const p1 = fractToCart(vertices[edge[0]].x, vertices[edge[0]].y, vertices[edge[0]].z);
        const p2 = fractToCart(vertices[edge[1]].x, vertices[edge[1]].y, vertices[edge[1]].z);
        drawCylinderLine(p1, p2, 0x00f0ff, 0.022);
    });
}

function drawCylinderLine(p1, p2, colorHex, radius = 0.02) {
    const direction = new THREE.Vector3().subVectors(p2, p1);
    const len = direction.length();
    const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    
    const geom = new THREE.CylinderGeometry(radius, radius, len, 6);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(center);
    
    const up = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    boundsGroup.add(mesh);
}

// Toggle rotation function
function toggleAutoRotate() {
    state.autoRotate = !state.autoRotate;
    
    // Sync checkbox
    const checkbox = document.getElementById('toggle-rotate');
    if (checkbox) checkbox.checked = state.autoRotate;
    
    // Sync floating button icon
    const btnIcon = document.getElementById('rotate-btn-icon');
    if (btnIcon) {
        btnIcon.setAttribute('data-lucide', state.autoRotate ? 'pause' : 'play');
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Canvas Click Atom Selector
let selectedMeshForColoring = null;

function handleCanvasClick(event) {
    if (!renderer || !camera) return;
    
    // Calculate pointer position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    
    // Raycast against all meshes in atomsGroup
    const intersects = raycaster.intersectObjects(atomsGroup.children, true);
    
    if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        
        // Ensure it's an atom sphere
        if (clickedMesh.geometry && clickedMesh.geometry.type === 'SphereGeometry') {
            showColorPicker(event.clientX, event.clientY, clickedMesh);
        }
    } else {
        hideColorPicker();
    }
}

function showColorPicker(clientX, clientY, mesh) {
    selectedMeshForColoring = mesh;
    const picker = document.getElementById('atom-color-picker');
    if (!picker) return;
    
    picker.style.display = 'block';
    
    const pickerWidth = 180;
    const pickerHeight = 65;
    let left = clientX + 10;
    let top = clientY + 10;
    
    if (left + pickerWidth > window.innerWidth) {
        left = clientX - pickerWidth - 10;
    }
    if (top + pickerHeight > window.innerHeight) {
        top = clientY - pickerHeight - 10;
    }
    
    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
}

function hideColorPicker() {
    const picker = document.getElementById('atom-color-picker');
    if (picker) {
        picker.style.display = 'none';
    }
    selectedMeshForColoring = null;
}

// Start the Visualizer on page load
window.onload = init;
