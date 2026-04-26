/**
 * configuracion de temas y rutas para tailwind
 */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: { 
                ianuarius: '#FE0000', 
                oscuro: '#171717', 
                gris: '#262626' 
            },
            fontFamily: { sans: ['Inter', 'sans-serif'] }
        },
    },
    plugins: [],
}