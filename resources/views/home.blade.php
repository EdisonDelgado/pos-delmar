@extends('layouts.app') @section('content')

<div class="container">
    <div class="row">
        <div class="col-md-12 col-lg-12">
            <div class="col-md-5 col-md-offset-1 col-sm-5 col-sm-offset-1">
            <div class="panel panel-warning">
                <div class="panel-heading">
                    <h3 class="panel-title">Control de Inventario</h3>
                </div>
                <div class="panel-body text-center">
                    <i class="home-icon fa fa-list-ul" aria-hidden="true"></i><br>
                    <a href="{{ url('/product') }}" class="btn btn-raised btn-warning">Ver Inventario</a>
                </div>
            </div>
            </div>
             <div class="col-md-5  col-sm-5 ">
            <div class="panel panel-success">
                <div class="panel-heading">
                    <h3 class="panel-title">Punto de Venta</h3>
                </div>
                <div class="panel-body text-center">
                    <i class="home-icon fa fa-shopping-bag" aria-hidden="true"></i><br>
                    <a href="{{url('/salenote')}}" class="btn btn-raised btn-success">Punto de Venta</a>
                </div>
            </div>
            </div>
        </div>
    </div>
</div>


    <div class="col-md-12 lead ">
        <div class="col-sm-4 col-sm-offset-4 text-center">
            <img class="img-responsive " src="{{url('/images/logo_delmar.png')}}">
            <h3>Alejandro Volta #2340</h3>
            <h3>Temuco</h3>
            <p class="lead"><i class="fa fa-phone"></i> 452789645</p>
        </div>
        
    </div>

@endsection
