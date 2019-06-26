@extends('layouts.app') @section('content')
<div class="container-fluid">
    <div class="row">
        <div class="col-md-4">
            <div class="panel panel-success">
                <div class="panel-heading">
                    <h3 class="text-center" style="font-weight: 400; padding: 10px; margin-top: 0px; text-transform: uppercase">Ventas del Día</h3>
                </div>
                <div class="panel-body">
                    <h2 class="text-right">Total Día <strong class="text-danger">$ {{number_format($totalDay,0,",",".")}}</strong>
                    </h2>
                    <h3 class="text-right">Nº de Ventas <strong class="text-info">{{$sales}}</strong></h3>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="panel panel-success">
                <div class="panel-heading">
                    <h3 class="text-center" style="font-weight: 400; padding: 10px; margin-top: 0px; text-transform: uppercase;">Ventas del Mes</h3>
                </div>
                <div class="panel-body">
                    <h2 class="text-right">Total Mes <strong class="text-danger">$ {{number_format($totalMonth,0,",",".")}}</strong>
                    </h2>
                    <h3 class="text-right">Nº de Ventas <strong class="text-info">{{$salesMonth}}</strong></h3>
                </div>
            </div>
        </div>

        <div class="col-md-4 ">
            <div class="panel panel-success">
                <div class="panel-heading">
                    <h3 class="text-center" style="font-weight: 400; padding: 10px; margin-top: 0px; text-transform: uppercase;">Ventas del Año</h3>
                </div>
                <div class="panel-body">
                    <h2 class="text-right">Total Año <strong class="text-danger">$ {{number_format($totalYear,0,",",".")}}</strong>
                    </h2>
                    <h3 class="text-right">Nº de Ventas <strong class="text-info">{{$salesYear}}</strong></h3>
                </div>
            </div>
        </div>
    </div>

</div>
@endsection