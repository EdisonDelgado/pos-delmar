<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\SaleNote as SaleNote;
use App\SaleNoteDetail as SaleNoteDetail;
use Illuminate\Support\Facades\Input as Input;
use Illuminate\Support\Facades\Auth as Auth;
use App\Product as Product;
use Carbon\Carbon as Carbon;
use DB as DB;


class SaleNoteController extends Controller
{

    //
    public function getView()
    {
        //si es cajero
        //return view('cashierView');
        //si es vendedor
        return view('pos.sellerView');
    }

    public function getCheckoutView()
    {
        $ps = DB::table('sale_notes')->where('paid', 0)->get();
        $result = array();
        foreach ($ps as $sale) {
            $amount = 0;
            $sale->detail = DB::table('sale_note_details')->where('sale_note_id', '=', $sale->id)->get();
            foreach ($sale->detail as $detail) {
                $amount = $amount + $detail->total_price;
                $product = DB::table('products')->where('id', '=', $detail->product_id)->first();
                $detail->name = $product->name;
            }
            $sale->amount = $amount;
            $sale->neto = $amount / 1.19;
            $sale->iva = round($sale->neto * 0.19);
            $sale->neto = round($sale->neto);
            array_push($result, $sale);
        }
        return view('pos.cashierView', ['pendingSales' => $result]);
    }

    /****/

    public function checkout(Request $req)
    {
        $id = Input::get('id');
        if (!empty($id)) {
            $salenote = SaleNote::find($id);
            if (!$salenote->paid) {
                $salenote->paid = true;
                $salenote->document = Input::get('document');
                $salenote->amount = Input::get('amount');
                $salenote->save();
                foreach ($salenote->detail as $detail) {
                    $product = Product::find($detail->product_id);
                    $product->stock = $product->stock - $detail->quantity;
                    $product->save();
                }
                return response()->json($salenote, 200);
            } else {
                return response()->json($salenote, 400);
            }
        } else {
            $error = array('code' => 400, 'message' => 'No se ha encontrado la nota de venta');
            return response()->json($error, 400);
        }
    }

    public function delete(Request $req)
    {
        $id = $req->input('id');

        $user = Auth::user();
        if (!empty($user->id)) {
            $salenote = SaleNote::find($id);
            if ($salenote->paid == 1)
                return abort(403);
            if (!empty($salenote)) {
                $salenote->delete();
                return response()->json($salenote, 200);
            } else {
                return response()->json($id, 404);
            }
        }
        return abort(403);
    }

    public function save(Request $req)
    {
        $rows = Input::get('rows');
        $user = Auth::user();
        if (!empty($user->id)) {

            $input = array(
                'user_id'   => $user->id,
                'paid'      => false,
                'comment'   => ''
            );
            $saleNote = SaleNote::create($input);

            foreach ($rows as $sale) {
                $detail = new SaleNoteDetail();
                $detail->product_id = $sale['item']['id'];
                $detail->unit_price = $sale['item']['price'];
                $detail->total_price = $sale['total'];
                $detail->quantity = $sale['qty'];
                $saleNote->detail()->save($detail);
            }

            return response()->json($saleNote, 200);
        } else {
            return abort(403);
        }
    }

    public function saleReport(Request $request)
    {

        $sales = DB::table('sale_notes')
            ->whereDay('updated_at', '=', Carbon::today()->day)
            ->whereMonth('updated_at', '=', Carbon::today()->month)
            ->whereYear('updated_at', '=', Carbon::today()->year)
            ->sum('amount');
        $countSales = DB::table('sale_notes')
            ->whereDay('updated_at', '=', Carbon::today()->day)
            ->whereMonth('updated_at', '=', Carbon::today()->month)
            ->whereYear('updated_at', '=', Carbon::today()->year)
            ->count('amount');

        $salesMonth = DB::table('sale_notes')
            ->whereMonth('updated_at', '=', Carbon::today()->month)
            ->whereYear('updated_at', '=', Carbon::today()->year)
            ->sum('amount');

        $countSalesMonth = DB::table('sale_notes')
            ->whereMonth('updated_at', '=', Carbon::today()->month)
            ->whereYear('updated_at', '=', Carbon::today()->year)
            ->count('amount');

        $salesYear = DB::table('sale_notes')
            ->whereYear('updated_at', '=', Carbon::today()->year)
            ->sum('amount');

        $countSalesYear = DB::table('sale_notes')
            ->whereYear('updated_at', '=', Carbon::today()->year)
            ->count('amount');



        return view('reports.sales', ['salesYear'=> $countSalesYear, 'totalYear'=>$salesYear, 'sales' => $countSales, 'salesMonth' => $countSalesMonth, 'totalMonth' => $salesMonth, 'totalDay' => $sales]);
    }
}
