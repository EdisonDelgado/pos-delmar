@extends('layouts.app')
@section('content')
<script type="text/javascript">
    var checkout = new Checkout();

    
    $(document).ready(function(){
        resizeSidebar(); 
        checkout.setFirstNote();
        $('#ok-modal').click(function(){
            $('#modal').modal('hide');
            location.reload();
        });
        
        $(document).on("click", ".open-checkout-modal", function () {
            var myId = $(this).data('id');
            var myAmount = $(this).data('amount');
            $("#checkout-modal h1#total").html('Monto $' +$.number(myAmount, 0, ',', '.' ));
            
            $("#checkout-modal #pagar").on('click', function(){
                checkout.paid(myId);
                $("#checkout-modal").modal('hide');
            });
            
            $( "#checkout-modal #pago" ).keyup(function() {
                var pesos = $(this).val();
                if( pesos > myAmount){
                    $("#checkout-modal #vuelto").html('Vuelto $ <strong>'+ $.number(pesos-myAmount, 0, ',', '.' )+'</strong>');       
                }
                else{
                    $("#checkout-modal #vuelto").html('Vuelto $ <strong>0</strong>');
                }
            });
        });
    });
    
    $(window).bind('resize', function(){
        resizeSidebar();
    });
    

    /** redimensiona el sidebar***/
    function resizeSidebar(){
        var  hx = $(window).height(),
            nv = $('#main-menu').height(),
            wx= $(window).width();
        console.log('resize' +  wx);
        if(wx > 767)
            $('#sidebar-checkout').css('height', hx-nv);
        else
            $('#sidebar-checkout').css('height','100%');    
    }
    
    function Checkout(){
            var myself = this;
            var url = "{{ url('/pos/salenote/checkout/')}}";
            this.paid = function(id){
                $.ajaxSetup({
                    headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')}});
                 // Send the data using post
                var posting = $.post( url, { id: id, document : $('#document').val(), amount:$('#note_checkout').data('amount')} );
                // Put the results in a div
                posting.done(function( data ) {
                            /**var content = $( data ).find( "#content" );
                            $( "#result" ).empty().append( content );*/
                    myself.clear(data.id);
                 myself.openModal('Se registró la venta correctamente','Nota de venta '+data.id );
                
                });
                posting.error(function (error){
                    toastr.error(error.response, 'Error ' , {timeOut: 5000});
                }); 
            } 
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
                        myself.clear(data.id);
                        myself.openModal('Se ha eliminado la nota de venta nº '+data.id, 'Nota de venta');
                    },error: function(error){
                       toastr.error(error, 'Error', {timeOut: 5000});
                    }
                });                
            }
            this.setNote = function(sale){
                var content = $('#table-description').html('');
                var action =  $('#sale-action').html('');
                var total = 0;
                $('#id-sale').html(sale.id);
                sale.detail.forEach(function(item,index){
                      var row = '<tr><td>'+item.quantity+'</td>'+
                                '<td>'+item.name+'</td>'+
                                '<td>'+$.number(item.total_price, 0, ',', '.' )+'</td></tr>';  
                    content.append(row);
                });
                content.append('<tr class=" total warning"><td></td>'+
                                '<td class="text-right">Neto $</td>'+
                                '<td ><strong>'+$.number(sale.neto, 0, ',', '.' )+'<strong></td></tr>');
                content.append('<tr class="warning"><td></td>'+
                                '<td class="text-right">IVA $</td>'+
                                '<td ><strong>'+$.number(sale.iva, 0, ',', '.' )+'<strong></td></tr>');
                
                content.append('<tr class="lead success"><td></td>'+
                                '<td class="text-right">Total $</td>'+
                                '<td ><strong>'+$.number(sale.amount, 0, ',', '.' )+'<strong></td></tr>');
                
                action.append('<button id="note_checkout" data-toggle="modal" data-target="#checkout-modal" data-amount="'+sale.amount+'" data-id="'+sale.id+'" class="open-checkout-modal btn btn-raised btn-info">pagar</button>'+
            '<button id="note_cancel" class="btn btn-raised btn-danger" onclick="checkout.delete('+sale.id+')" >Cancelar</button>');

            $('#list-note a').each(function(index,item){
                $(this).removeClass('active');
                $(this).click(function(){
                   $(this).addClass('active'); 
                });

            });
                
            }
            this.clear = function(id){
                $('#'+id).remove();
            }
            this.setFirstNote = function(){
                var first = $('#list-note a').first().data('sale');
                if(first!= null) myself.setNote(first);
                $('#list-note a').first().addClass('active');
            }
            this.openModal = function(msg, title){
                $('#modal-message').html('');
                $('#modal-title').html('')
                $('#modal-message').html(msg);
                $('#modal-title').html(title);
                $('#modal').modal('show');
            }
        }

            
</script>
<!-- contenido -->
<meta name="csrf-token" content="{{ csrf_token() }}">
<section class="container-fluid">
    @if(count($pendingSales)>0)
    <section id="sidebar-checkout" class="col-sm-4 col-md-4 col-lg-4 container">
        <div class="col-md-12">
            <h4 class="lead white">VENTAS PENDIENTES</h4>
            <hr>
            <div id="list-note" class="list-group">
               @foreach($pendingSales as $sale)
                <a class="list-group-item lead note-item" data-sale="{{json_encode($sale)}}" id="{{$sale->id}}"  onclick="checkout.setNote({{json_encode($sale)}})"><i class="fa fa-sticky-note" aria-hidden="true"></i> Nº {{$sale->id}} <strong style="float:right;"class="text-center">${{number_format($sale->amount,0,",",".")}}</strong></a>
               @endforeach
            </div>
        </div>
    </section>
    <section class="col-sm-8 col-md-8 col-lg-8 container">
    <div class="col-md-12">
        <div class="row col-sm-12">
            <h3>Nota de Venta nº <strong id="id-sale"></strong></h3>
        </div>

            <table class="table">
             <thead>
            <tr>
                <th>Cantidad</th>
                <th>Descripción</th>
                <th>Total</th>
            </tr>
            </thead>
            <tbody id="table-description">
            </tbody>
            </table>
        <div id="sale-action" class="row col-sm-12 text-rigth"></div>
    </div> 
    </section>

    @else
    <div class="col-md-12 lead ">
        <div class="col-sm-4 col-sm-offset-4">
              <img class="img-responsive " src="{{url('/images/logo_delmar.png')}}">
        </div>
        <div class="col-md-12 text-center lead"><strong class="">No hay notas de ventas pendientes</strong></div>
    </div>
    @endif

</section>
<div id="modal" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h4 id="modal-title" class="modal-title">Modal title</h4>
      </div>
      <div class="modal-body">
        <p id="modal-message"></p>
      </div>
      <div class="modal-footer">
        <button id="ok-modal" type="button"  class="btn btn-primary">Aceptar</button>
      </div>
    </div>
  </div>
</div>

<div id="checkout-modal" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
      </div>
      <div class="modal-body">
        <form>
          <div class="row col-sm-12 text-right">
              <h1 class="text-right"id="total"></h1>

              <input class="form-control" type="number" id="document" name="document" value="" placeholder="nº boleta o factura">
              <input class="form-control" type="number" id="pago" name="pago" value="" placeholder="Pago">
              <h1 class="" id="vuelto">0</h1>
        </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>
        <button id="pagar" type="button" class="btn btn-raised btn-info">Confirmar pago</button>
      </div>
    </div>
  </div>
</div>
@endsection