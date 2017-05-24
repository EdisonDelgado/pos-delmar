<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/
use Illuminate\Http\Request;


Route::get('/', 'HomeController@index');
Route::auth();

Route::group(['middleware' => ['role:Admin, access_backend']], function () {
    Route::get('/home', 'HomeController@index');
    Route::get('/products', 'ProductController@getView');
    Route::post('/product/create', 'ProductController@create');
    Route::get('/product', 'ProductController@getNewView');
    Route::get('/product/{id}', ['uses' =>'ProductController@productById']);
    Route::put('/product/', 'ProductController@update');
    Route::delete('/product/','ProductController@delete');
    Route::get('/products/find', 'ProductController@productByName');
    Route::get('/salenote', 'SaleNoteController@getView');
    Route::get('/checkout', 'SaleNoteController@getCheckoutView');
    Route::post('/pos/salenote/', 'SaleNoteController@save');
    Route::post('/pos/salenote/checkout/', 'SaleNoteController@checkout');
    Route::delete('/pos/salenote/checkout/','SaleNoteController@delete');
    Route::get('/reports/sales/','SaleNoteController@saleReport');

    
});




