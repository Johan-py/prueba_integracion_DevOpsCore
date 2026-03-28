<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido | Mi App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen">
    
    <div class="container mx-auto px-4 py-16">
        <!-- Tarjeta principal -->
        <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center">
                <h1 class="text-5xl font-bold text-white mb-4">
                    ¡Bienvenido! 🎉
                </h1>
                <p class="text-blue-100 text-xl">
                    Nos alegra tenerte aquí
                </p>
            </div>
            
            <!-- Contenido -->
            <div class="px-8 py-12 text-center">
                <div class="text-7xl mb-6">👋</div>
                <h2 class="text-3xl font-bold text-gray-800 mb-4">
                    Hola, visitante
                </h2>
                <p class="text-gray-600 text-lg mb-8">
                    Gracias por visitar nuestra plataforma. <br>
                    Estamos emocionados de tenerte con nosotros.
                </p>
                
                <div class="space-y-4">
                    <button class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition duration-300">
                        Comenzar ahora
                    </button>
                    
                    <button class="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
                        Explorar más
                    </button>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-gray-50 px-8 py-4 text-center border-t">
                <p class="text-gray-500">
                    ✨ Hecho con ❤️ para ti ✨
                </p>
            </div>
        </div>
        
        <!-- Características -->
        <div class="max-w-4xl mx-auto mt-12 grid md:grid-cols-3 gap-6">
            <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                <div class="text-4xl mb-3">⚡</div>
                <h3 class="font-bold text-lg">Rápido</h3>
                <p class="text-gray-600 text-sm">Carga instantánea</p>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                <div class="text-4xl mb-3">📱</div>
                <h3 class="font-bold text-lg">Responsive</h3>
                <p class="text-gray-600 text-sm">Funciona en todos los dispositivos</p>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                <div class="text-4xl mb-3">🎨</div>
                <h3 class="font-bold text-lg">Moderno</h3>
                <p class="text-gray-600 text-sm">Diseño atractivo</p>
            </div>
        </div>
    </div>
    
</body>
</html>