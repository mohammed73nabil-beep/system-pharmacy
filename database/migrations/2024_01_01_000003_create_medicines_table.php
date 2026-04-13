<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('barcode')->nullable()->unique();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('manufacturer')->nullable(); // الشركة المصنعة
            $table->string('unit')->default('علبة'); // وحدة القياس
            $table->decimal('purchase_price', 10, 2)->default(0); // سعر الشراء
            $table->decimal('selling_price', 10, 2)->default(0); // سعر البيع
            $table->integer('quantity')->default(0); // الكمية الحالية
            $table->integer('min_quantity')->default(10); // الحد الأدنى (نقطة الطلب)
            $table->date('expiry_date')->nullable(); // تاريخ الانتهاء
            $table->string('location')->nullable(); // مكان في الصيدلية
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
