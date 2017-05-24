<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SaleNote extends Model
{
    
    protected $fillable = [
        'user_id', 'paid', 'comment',
    ];
    
    //
    public function detail()
    {
        return $this->hasMany('App\SaleNoteDetail');
    }
}
