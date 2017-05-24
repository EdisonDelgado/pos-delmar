@extends('layouts.app') @section('content')

<div class="container-fluid">
    <!--end Search row-->
    <!--Start table products-->
    <div class="row">
        <div class="col-md-4 col-lg-4">
           <form class="">
                <div class="form-group label-floating">
                    <label class="control-label" for="find_product">Buscar un producto</label>
                    <div class="input-group col-md-12">
                        <input type="text" name="find" id="find_product" class="form-control">
                        <!--span class="input-group-btn"><button type="submit" class="btn btn-fab btn-fab-mini"><i class="fa fa-search"></i></button></span-->
                    </div>
                </div>
            </form>
            <article id="response">
                <div id="single_product_detail" class="">
                </div>
            </article>
        </div>
        <div class="col-lg-8 col-md-8 ">
            <table class="table  table-hover table-bordered">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Código Barras</th>
                        <th>Descripción</th>
                        <th>Stock</th>
                        <th>Precio Venta</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($products as $product)
                    <tr class="active">
                        <td>{{$product->id}}</td>
                        <td>{{$product->barcode}}</td>
                        <td>{{$product->name }}</td>
                        <td>{{$product->stock }}</td>
                        <td class="text-right"> <strong>$ {{number_format($product->sale_price,0,",",".")}}</strong></td>
                        <td class="text-center"><a  class="btn btn-raised btn-info" href="{!! url('product', ['id'=>$product->id] ) !!}">ver</a></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
             {{ $products->links() }} 
        </div>
    </div>
</div>
<script type="application/javascript">
                    $("#find_product").autocomplete({
                    source: function(req, res){
                        $.getJSON(
                                "{{ url('products/find/')}}",
                                {find:$('#find_product').val()},
                                res
                        );
                    },
                    minLength: 3,
                    select: function( event, ui ) {
                        currentItem = ui.item;
                        
                        var stock = ui.item.stock == null? 'sin stock': ui.item.stock,
                            price = ui.item.price == null? 'sin precio': ui.item.price,
                            html = '<div id="current_item" class="">'+
                                        '<h3>'+ui.item.name+'</h3>'+
                                        '<div class="">'+   
                                            '<h2><strong>$ '+$.number( price, 0, ',', '.' )+'</strong></h2>'+
                                            '<h4>'+stock+' unid.</h4>'+ 
                                            '<a href="{{url("product")}}'+'/'+ui.item.id+'" class="btn btn-raised btn-info">editar</a>'+
                                        '</div>'+
                                    '</div>';
                        //**//
       
                        $('#single_product_detail').html(html);
                    }
                });
</script>
@endsection