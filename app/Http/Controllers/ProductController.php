<?php

namespace App\Http\Controllers;

use Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Paginator as Paginator;
use App\Http\Requests;
use DB as DB;
use App\Product as Product;
use Illuminate\Support\Facades\Input as Input;
use Illuminate\Support\Facades\Auth as Auth;

class ProductController extends Controller
{
    //
    public function __construct(){  
    }
    
    /** Return view  with all products **/
    public function getView(){
        $products = DB::table('products')->orderBy('name', 'asc')->paginate(12);
        return view('products.products',['products'=>$products]);
    }
    
    
    /** Create a new Product **/
    public function create(Request $request)
    {
        /** Obtain the input data form */
        $input = $request->only(['barcode', 'name', 'stock','cost_price','sale_price']);
        
        if(empty($input['barcode'])) unset($input['barcode']);
        if(empty($input['stock'])) unset($input['stock']);
        
        $rules = [
            'name' => 'required|min:5|max:255',
            'cost_price' => 'required',
            'sale_price' => 'required',
            'stock' =>'required'
        ];
        $messages = [
            'name.required' => 'El nombre es requerido',
            'name.min' => 'El nombre debe tener a lo menos 5 caracteres',
            'name.max' => 'El nombre no debe exceder los 255 caracteres',
            'cost_price.required' => 'El precio de costo es requerido',
            'sale_price.required' => 'El precio de venta es requerido',
            'stock.required' =>'El stock es requerido'
        ];
        /** Validate data **/
        $validator = Validator::make( $input, $rules, $messages);
        
        if($validator->fails()){
            /*Redirect with errors*/
             return redirect('/product/')
                        ->withErrors($validator)
                        ->withInput();
        }
        /**create a new product*/
        $product = Product::create($input);
        
        return view('products.product',['product'=>$product]);
    }
    
    /***/
    public function update(Request $request){
        if(Auth::user()->id){
            $id = Input::get('id');
            if($id){
                $product = Product::find($id);
                $input = $request->only(['barcode','name','stock','cost_price','sale_price']);
                $product->fill($input);
                $product->save();
                return response()->json($product,200);
            }else{
                 return response()->json('Not found', 404);
            }
        }else{
            return abort(403);
        }
    }
    
    
    /* Find product by name */
    public function productByName(Request $req){
        $input = Input::get('find');
        if(empty($input)){
            return response()->json('');
        }else{
            $products = Product::where('name','like','%'.$input.'%')
                ->orderBy('name')->get();
            $result = array();
            foreach($products as $product){
                array_push($result, 
                           ['id'=>$product->id, 
                            'value'=>$product->name,
                            'name'=>$product->name,
                            'price'=>$product->sale_price,
                            'stock'=>$product->stock
                           ]);
            }
           return response()->json($result);
        }

    }
    
    public function delete(Request $req){
        if(Auth::user()->id){
            $id = Input::get('id');
            if(!empty($id)){
                $product = Product::find($id);
                $product->delete();
                return response()->json($product, 200);
            }else{
                return response()->json('fail', 404);
            } 
        }else{
            return abort(403);
        }
    }
    
    public function getNewView(){
        return view('products.product',['product'=>'']);
    }
    
    public function productById($id){
        return view('products.product',['product'=>Product::find($id)]);
        
    }
    
}
