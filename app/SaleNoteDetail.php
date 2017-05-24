<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SaleNoteDetail extends Model
{
     protected $fillable = [
         'product_id','unit_price','total_price', 'quantity'
     ];
    
    
    //definición del la relación con la nota de venta, muchos a uno
    public function sale_note()
    {
        return $this->belongsTo('App\SaleNote');
    }
    
    public function product(){
        return $this->hasOne('App\Product');
    }
}
