<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSaleNoteDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
           Schema::create('sale_note_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('product_id')->unsigned();
            $table->integer('unit_price');
            $table->integer('total_price');
            $table->smallInteger('quantity');  
            $table->bigInteger('sale_note_id')->unsigned();
            $table->timestamps();
               
            $table->foreign('sale_note_id')->references('id')->on('sale_notes')->onDelete('cascade'); 
            
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
       Schema::drop('sale_note_details');
    }
}
