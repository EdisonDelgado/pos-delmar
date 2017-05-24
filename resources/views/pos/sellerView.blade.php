@extends('layouts.app')
@section('content')
<meta name="csrf-token" content="{{ csrf_token() }}">
<!-- contenido -->
<section  id="" class="container-fluid">
    
    <div class="row">
        <div  class="col-md-4 col-lg-4">
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
                <div class="text-right">
                    <button style="display:none" id="add_product" class="btn btn-success btn-fab"><i class="material-icons">add</i></button>
                </div>
            </article>
        </div>
        <div  class="col-md-8 col-lg-8 ">
            <h3 id="id_note" >Nota de Venta Nº <span></span></h3>
            <table id="note_table" class="table table-striped table-hover">
              <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th class="text-right">Precio Unitario</th>
                <th class="text-right">Precio Total</th>
                <th></th>
              </tr>
              </thead>
              <tbody id="note_table_body">
              <tr class="info">
              </tr>
              </tbody>
            </table>
            <div style="display: none" id="tools" class="text-right">
            <div class="sale-total">
                <div class="text-right">
                    <h2 class="lead"><strong id="sale_total">$ 0</strong></h2>
                </div>
            </div>

            <button id="clearnote" type="button" class="btn btn-raised btn-danger btn-lg" onclick="saleTable.clear()">
              Borrar
            </button>
            <!-- Button trigger modal -->
            <button id="savenote" type="button" class="btn btn-raised btn-success btn-lg" data-toggle="modal" data-target="#saveItems">
              Guardar
            </button>
            </div>
        </div>

    </div>
</section>
<div class="clearfix"></div>

<div id="saveItems" class="modal fade">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h4 class="modal-title">Nueva nota de venta</h4>
      </div>
      <div class="modal-body">
        <p>¿Desea guardar esta nota de venta?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">No</button>
        <button type="button" onclick="saleTable.save()" class="btn btn-primary">Guardar</button>
      </div>
    </div>
  </div>
</div>

    <script type="text/javascript">
            window.onbeforeunload = function() {
                return function(){
                    alert('alert');
                };
            }
           
                var currentItem = '',
                    table = $('#note_table_body');
                var saleTable = new tableRow(table);
                
                
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
                        $('#add_product').hide();
                        currentItem = ui.item;

                        var stock = ui.item.stock == null? 'sin stock': ui.item.stock,
                            price = ui.item.price == null? 'sin precio': ui.item.price,
                            html = '<div id="current_item" class="">'+
                                        '<h3>'+ui.item.name+'</h3>'+
                                        '<div class="text-right">'+   
                                            '<h2><strong>$ '+$.number( price, 0, ',', '.' )+'</strong></h2>'+
                                            '<h4>'+stock+' unid.</h4>'+           
                                        '</div>'+
                                    '</div>';
                        //**//
       
                        $('#single_product_detail').html(html);

                        //descomentar estas lineas en producción.
                       if(currentItem.stock <= 0)
                            $('#add_product').hide();
                        else
                        $('#add_product').show();
                        //alert(ui.item.value);
                    }
                });
                
                $("#add_product").click(function(){
                    //console.log(currentItem.stock);
                    saleTable.addRow(currentItem);  
                    $('#current_item').remove();
                    $('#find_product').val('');
                    $('#add_product').hide();
                    currentItem = '';
                    
                });
        
                /***/
                function tableRow(table){
                    
                    var table = table;
                    var rows = []; 
                    var total = $('#sale_total');
                    var myself = this;
                    var url = "{{ url('pos/salenote/')}}";
                    
                    
                    this.updateRow = function(action){
                        if(rows.length>0)
                            this.showTools();
                        
                        var amount = 0;   
                        $.each(rows, function(index, row){
                            //actualizar las cantidades
                            var select = $('#select'+row.id+'');
                            row.qty = select.val();
                            //actualizar el total
                            row.total = row.qty * row.item.price;
                            //console.log(row.total);
                            var total = "$ " +$.number((row.qty * row.item.price),0,',','.');
                            $('#total_'+row.id).html(total);
                            //actualizar el total de la compra.
                            amount = amount + row.total;

                        });

                        var html = "$ " +$.number(amount,0,',','.');
                        //console.log(html);
                        total.html(html);
                    },
                        
                    this.addRow = function(item){
                        var row = {
                            item: item,
                            qty : 1,
                            id : new Date().getTime(),
                            total: this.qty * item.price
                        }
                    
                        var total = row.qty*item.price;
                        var html = 
                            '<tr id="'+row.id+'" class="info">'+
                                '<td id="">'+item.name+'</td>'+
                                '<td id="qty_'+row.id+'" class="select">'+this.getSelect(row)+'</td>'+ 
                                '<td  class="text-right" id="price_'+row.id+'">'+$.number( item.price, 0, ',', '.' )+'</td>'+
                                '<td class="text-right" id="total_'+row.id+'">'+$.number( total, 0, ',', '.' )+'</td>'+ 
                                '<td class="text-right"><div class="btn-group-sm"><button id="delete_'+row.id+'" onclick="saleTable.deleteRow('+row.id+')" class="btn btn-danger btn-fab"><i class="material-icons">delete</i></button></div></td>'+ 
                            '</tr>';
                        rows.push(row);
                        table.append(html);

                        //cuando el select cambia de valor;
                        var select = $('#select'+row.id+'');
                        select.change(function(){
                            saleTable.updateRow();
                        });
                        this.updateRow();
                    },
                    this.deleteRow = function(id){
                        var row = this.getRow(id);
                        var index = rows.indexOf(row);
                        //console.log(index + JSON.stringify(row));
                        rows.splice(index, 1);
                        $('#'+id).remove();
                        this.updateRow();
                    },
                    this.getRow = function(id){
                        for(i=0;i<rows.length;i++){
                            console.log(i);
                            if(id === rows[i].id)
                                return rows[i];
                        }
                        return -1;
                    },
                    //Crea un conjunto de valores a partir del stock de los productos.
                    this.getSelect = function(row){
                        //row.item.stock = 10; //comentar esta linea en produccción.
                        var options = '<select class="form-control" id="select'+row.id+'">';

                        for(var i = 1; i <= row.item.stock; i++){
                            options += '<option value="'+i+'">'+i+'</option>';
                        }
                        return options +'</select>';
                    },

                    this.save = function(){
                        $("#saveItems").modal('hide');
                        $.ajaxSetup({
                                headers: {
                                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                }
                            });
                          // Send the data using post
                          var posting = $.post( url, { rows: rows} );
                          // Put the results in a div
                          posting.done(function( data ) {
                              $("#id_note span").html(data.id);
                              toastr.success('Se ha creado la nota de venta nº '+data.id, 'Nueva Venta', {timeOut: 5000});
                              $("#savenote").prop( "disabled", true );
                          });
                          posting.error(function (error){
                                toastr.error(error, 'Error', {timeOut: 5000});
                          });
                    },
                    this.clear = function(){
                        //alert("clear");$
                        $("#savenote").prop( "disabled", false);
                        $.each(rows, function(index, row){
                            myself.deleteRow(row.id);
                        });
                        rows = []; 
                        this.hideTools();
                        this.updateRow();
                        //console.log('total rows '+ rows.length);
                    }, 
                    this.showTools = function(){
                        $('#tools').show();
                    },                    
                    this.hideTools = function(){
                        $('#tools').hide();
                    }

                };
                
        </script>
@endsection