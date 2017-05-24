<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id');
            /*$table->integer('category_id')->index();
            $table->integer('provider_id')->index();*/
            $table->string('barcode')->nullable();//código de barras
            $table->string('name', 100);
            $table->integer('stock')->default(0);
            $table->integer('cost_price')->nullable();
            $table->integer('sale_price')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('products');
    }
}
