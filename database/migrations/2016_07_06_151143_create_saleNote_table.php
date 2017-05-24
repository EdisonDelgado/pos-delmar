<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use DB as DB;

class CreateSaleNoteTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
         Schema::create('sale_notes', function (Blueprint $table) {
             $table->bigIncrements('id');
             $table->integer('user_id')->unsigned();
             $table->boolean('paid')->default(false);//estado pagado true, no pagado false
             $table->string('comment')->nullable();
             $table->string('document')->nullable();
             $table->integer('amount')->nullable();
             $table->timestamps();
             $table->foreign('user_id')->references('id')->on('users');// id del vendedor
        });
        DB::update("ALTER TABLE sale_notes AUTO_INCREMENT = 1000");
    }
    

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sale_notes');
    }
}
