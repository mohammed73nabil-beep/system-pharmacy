<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all settings as a key-value pair object.
     */
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Store or update multiple settings.
     */
    public function store(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            // value could be boolean, string, integer
            Setting::set($key, $value);
        }

        return response()->json(['message' => 'Settings saved successfully', 'settings' => Setting::all()->pluck('value', 'key')]);
    }
}
