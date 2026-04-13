<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Medicine;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::factory()->create([
            'name' => 'هيثم الفقية',
            'email' => 'admin@al-amal.com',
            'password' => Hash::make('password'),
        ]);

        // Categories
        $categories = [
            ['name' => 'Antibiotics', 'name_ar' => 'مضادات حيوية'],
            ['name' => 'Painkillers', 'name_ar' => 'مسكنات ألم'],
            ['name' => 'Cosmetics', 'name_ar' => 'مستحضرات تجميل'],
            ['name' => 'Vitamins', 'name_ar' => 'فيتامينات'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        // Suppliers
        $suppliers = [
            ['name' => 'United Pharma', 'phone' => '0555555555', 'email' => 'contact@united.com'],
            ['name' => 'Modern Medicine Co', 'phone' => '0122222222', 'email' => 'sales@modern.com'],
        ];

        foreach ($suppliers as $sup) {
            Supplier::create($sup);
        }

        // Customers
        Customer::create(['name' => 'Walk-in Customer', 'phone' => '0000000000']);
        Customer::create(['name' => 'Mohammed Ali', 'phone' => '0567890123']);

        // Medicines
        $medicines = [
            [
                'name' => 'Panadol Extra', 
                'name_ar' => 'بانادول اكسترا', 
                'barcode' => '628123456789',
                'category_id' => 2,
                'supplier_id' => 1,
                'purchase_price' => 10.50,
                'selling_price' => 15.00,
                'quantity' => 100,
                'min_quantity' => 20,
                'expiry_date' => '2026-12-31'
            ],
            [
                'name' => 'Amoxicillin 500mg', 
                'name_ar' => 'أموكسيسيلين', 
                'barcode' => '628111111111',
                'category_id' => 1,
                'supplier_id' => 1,
                'purchase_price' => 25.00,
                'selling_price' => 38.50,
                'quantity' => 50,
                'min_quantity' => 10,
                'expiry_date' => '2025-06-30'
            ],
            [
                'name' => 'Centrum Silver', 
                'name_ar' => 'سنتروم سيلفر', 
                'barcode' => '628222222222',
                'category_id' => 4,
                'supplier_id' => 2,
                'purchase_price' => 85.00,
                'selling_price' => 120.00,
                'quantity' => 15,
                'min_quantity' => 5,
                'expiry_date' => '2027-01-01'
            ],
        ];

        foreach ($medicines as $med) {
            Medicine::create($med);
        }
    }
}
