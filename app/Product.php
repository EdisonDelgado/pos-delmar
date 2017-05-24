<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
     protected $fillable = [
        'barcode', 'name', 'cost_price', 'stock', 'sale_price'
    ];
    
}
