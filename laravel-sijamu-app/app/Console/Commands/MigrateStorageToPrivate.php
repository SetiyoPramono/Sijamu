<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class MigrateStorageToPrivate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sijamu:secure-storage {--dry-run : Tampilkan file yang akan dipindahkan tanpa mengubah disk fisik}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrasi berkas dokumen mutu dan RPS dari storage publik ke storage privat untuk keamanan';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $this->info($isDryRun ? '🔍 Menjalankan simulasi (Dry Run)...' : '🚀 Memulai migrasi berkas ke Private Storage...');

        $publicRoot = storage_path('app/public');
        $privateRoot = storage_path('app/private');

        if (!File::exists($privateRoot)) {
            File::makeDirectory($privateRoot, 0755, true);
        }

        $directoriesToMigrate = ['mutu', 'rps'];
        $migratedCount = 0;

        foreach ($directoriesToMigrate as $dir) {
            $sourceDir = $publicRoot . DIRECTORY_SEPARATOR . $dir;
            $targetDir = $privateRoot . DIRECTORY_SEPARATOR . $dir;

            if (!File::isDirectory($sourceDir)) {
                $this->line("Direktori public/{$dir} tidak ditemukan, melewati...");
                continue;
            }

            $files = File::allFiles($sourceDir);

            foreach ($files as $file) {
                // Abaikan .gitignore
                if ($file->getFilename() === '.gitignore') {
                    continue;
                }

                $relativePath = str_replace($publicRoot . DIRECTORY_SEPARATOR, '', $file->getPathname());
                $destinationPath = $privateRoot . DIRECTORY_SEPARATOR . $relativePath;
                $destinationFolder = dirname($destinationPath);

                $this->line("Menemukan berkas: <comment>{$relativePath}</comment>");

                if (!$isDryRun) {
                    if (!File::isDirectory($destinationFolder)) {
                        File::makeDirectory($destinationFolder, 0755, true);
                    }

                    // Pindahkan berkas
                    File::move($file->getPathname(), $destinationPath);
                    $this->info(" -> Berhasil dipindahkan ke private/{$relativePath}");
                } else {
                    $this->line(" [Dry Run] Akan dipindahkan ke: private/{$relativePath}");
                }

                $migratedCount++;
            }

            // Bersihkan folder kosong di public jika bukan dry run
            if (!$isDryRun) {
                $subDirs = File::directories($sourceDir);
                foreach ($subDirs as $sub) {
                    if (count(File::allFiles($sub)) === 0) {
                        File::deleteDirectory($sub);
                    }
                }
                if (count(File::allFiles($sourceDir)) === 0) {
                    File::deleteDirectory($sourceDir);
                }
            }
        }

        $this->newLine();
        if ($migratedCount === 0) {
            $this->info('✅ Tidak ada berkas di storage publik yang perlu dipindahkan. Semua berkas sudah aman di disk privat.');
        } else {
            $this->info("🎉 Selesai! Total {$migratedCount} berkas " . ($isDryRun ? 'terdeteksi untuk dimigrasikan.' : 'berhasil diamankan ke Private Storage.'));
        }

        return Command::SUCCESS;
    }
}
