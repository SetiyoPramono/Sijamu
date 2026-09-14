<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistem Dalam Pemeliharaan - SIJAMU 2.0</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                    },
                    colors: {
                        primary: '#057A55', // Tailwind emerald-700
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans min-h-screen flex items-center justify-center p-6">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center relative border border-gray-100">
        <!-- Top decorative bar -->
        <div class="h-2 w-full bg-gradient-to-r from-emerald-400 via-primary to-emerald-800"></div>
        
        <div class="p-10 md:p-14">
            <div class="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            
            <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Sistem Sedang Diperbarui</h1>
            <p class="text-gray-500 mb-8 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                Halo! Saat ini <b>SIJAMU 2.0</b> sedang dalam mode pemeliharaan <i>(Maintenance Mode)</i> untuk meningkatkan kualitas dan performa sistem. 
                <br><br>
                Kami akan segera kembali dalam beberapa saat. Terima kasih atas kesabaran Anda.
            </p>
            
            <div class="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full text-sm font-semibold border border-emerald-100">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Tim Admin sedang bekerja
            </div>
        </div>
        
        <div class="bg-gray-50 py-4 px-6 border-t border-gray-100 text-sm text-gray-400 font-medium">
            &copy; 2026 SIJAMU 2.0 - Sistem Penjaminan Mutu
        </div>
    </div>
</body>
</html>
