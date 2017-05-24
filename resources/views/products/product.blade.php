@extends('layouts.app')
@section('content')
<meta name="csrf-token" content="{{ csrf_token() }}">
<section class="container-fluid">
<div class="row">

    <div class="col-md-offset-3 col-md-6">
             <div class="">
              @if (count($errors) > 0)
                    <div class="alert alert-danger">
                        <ul>
                            @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                    @endif
            </div>
            @if($product)
                <form class="form-horizontal">
                     <input type="hidden" class="form-control" value="{{$product->id}}" id="id" name="id">
            @else 
                <form class="form-horizontal" method="post" action="{{url('product/create')}}">
            @endif    
                <div class="form-group">
                    <label for="codebar" class="col-sm-2 control-label">Código</label>
                    <div class="col-sm-10">
                        @if($product)
                        <input type="text" class="form-control" name="barcode" id="barcode" placeholder="Código barra" value="{{$product->barcode}}">
                        @else
                        <input type="text" class="form-control" name="barcode" id="barcode" placeholder="Código barra">
                        @endif
                    </div>
                </div>
                <!-- Nombre-->
                <div class="form-group">
                    <label for="name" class="col-sm-2 control-label">Nombre</label>
                    <div class="col-sm-10">
                        @if($product)
                        <input type="text" class="form-control" name="name" id="name" placeholder="Nombre" value="{{$product->name}}">
                        @else
                        <input type="text" class="form-control" name="name" id="name" placeholder="Nombre">
                        @endif
                    </div>
                </div>
                <!-- Cantidad -->
                <div class="form-group">
                    <label for="stock" class="col-sm-2 control-label">Cantidad</label>
                    <div class="col-sm-10">
                        <div class="input-group spinner spn-qty">
                            @if($product)
                            <input type="number" min="0" class="number-spinner form-control" name="stock" id="stock" value="{{$product->stock}}">
                            @else
                            <input type="number" min="0" class="number-spinner form-control" name="stock" id="stock" value="0">
                            @endif
                            <div class="input-group-btn-vertical">
                                <button class="btn btn-default" type="button"><i class="fa fa-caret-up"></i></button>
                                <button class="btn btn-default" type="button"><i class="fa fa-caret-down"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Precio Costo -->
                <div class="form-group">
                    <label for="cost_price" class="col-sm-2 control-label">Precio Costo</label>
                    <div class="col-sm-10">
                        <div class="input-group spinner spn-prc">
                            @if($product)
                            <input type="number" min="0" class="number-spinner form-control" name="cost_price" id="cost_price" value="{{$product->cost_price}}">
                            @else
                            <input type="number" min="0" class="number-spinner form-control" name="cost_price" id="cost_price" value="0">
                            @endif
                            <div class="input-group-btn-vertical">
                                <button class="btn btn-default" type="button"><i class="fa fa-caret-up"></i></button>
                                <button class="btn btn-default" type="button"><i class="fa fa-caret-down"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <!---->
                <!-- Precio Venta -->
                <div class="form-group">
                    <label for="cost_price" class="col-sm-2 control-label">Precio Venta</label>
                    <div class="col-sm-10">
                        <div class="input-group spinner spn-sprc">
                            @if($product)
                            <input type="number" min="0" class="number-spinner form-control" name="sale_price" id="sale_price" value="{{$product->sale_price}}">
                            @else
                            <input type="number" min="0" class="number-spinner form-control" name="sale_price" id="sale_price" value="0">
                            @endif
                            <div class="input-group-btn-vertical">
                                <button class="btn btn-default" type="button"><i class="fa fa-caret-up"></i></button>
                                <button class="btn btn-default" type="button"><i class="fa fa-caret-down"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-sm-offset-2 col-sm-10">
                    @if($product)
                        <a onclick="product.update({{$product->id}})" class="btn btn-raised btn-info">Actualizar</a>
                        <a onclick="product.delete({{$product->id}})" class="btn btn-raised btn-danger">Eliminar</a>
                        <a href="{{url('/product')}}" class="btn btn-raised btn-success">Agregar</a>
                    @else
                       <button type="submit" class="btn btn-raised btn-success">Nuevo Producto</button>
                    @endif
                    </div>
                </div>
                {{csrf_field()}}
            </form>
    </div>
    <script type="text/javascript">
        var product = new Product(); 
        function Product(){
            var url = "{{ url('/product/')}}";

            this.delete = function(id){            
                $.ajax(
                {
                    url: url,
                    type: 'DELETE',
                    dataType: "JSON",
                    data: {
                        "id": id,
                        "_method": 'DELETE',
                        "_token": $('meta[name="csrf-token"]').attr('content'),
                    },
                    success: function (data)
                    {
                        toastr.success('Se ha eliminado el producto '+data.id, 'Producto Eliminado', {timeOut: 5000});
                        window.setTimeout(function(){ window.location = "{{url('/product')}}"; },3000);
                    },error: function(error){
                        console.log(error.responseText);
                        toastr.error(error, 'Error', {timeOut: 5000});
                    }
                });                
            },
            this.update = function(id){
                $.ajax(
                {
                    url: url,
                    type: 'PUT',
                    dataType: "JSON",
                    data: {
                        "id": id,
                        "_token": $('meta[name="csrf-token"]').attr('content'),
                        "name" : $('#name').val(),
                        "barcode": $('#barcode').val(),
                        "sale_price": $('#sale_price').val(),
                        "cost_price": $('#cost_price').val(),
                        "stock" :$('#stock').val(),
                    },
                    success: function (data)
                    {
                        toastr.success('Se ha Actualizado el producto '+data.id, 'Producto Actualizado', {timeOut: 5000});
                        /*window.setTimeout(function(){ window.location = url+'/'+data.id; },3000);*/
                    },
                    error: function(error){
                        console.log(error);
                        toastr.error(error, 'Error', {timeOut: 5000});
                    }
                });                 
            }    
        }
    </script>
</div>
</section>
@endsection