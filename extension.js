const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const Atspi = imports.gi.Atspi;
const GLib = imports.gi.GLib;
const Meta = imports.gi.Meta;

const ExtensionUtils = imports.misc.extensionUtils;
const GestureTapAction = ExtensionUtils.getCurrentExtension().imports.gestureTapAction;


const RightClickAction = new Lang.Class({
	Name: 'RightClickAction',
	Extends: Clutter.TapAction,

	_init: function() {
		this.parent();

		this._cursorTracker = Meta.CursorTracker.get_for_screen(global.screen);
	},

	vfunc_gesture_prepare: function() {
		return this.get_n_current_points() == 1;
	},

	vfunc_gesture_end: function() {
		let [x, y] = this.get_press_coords(0);
		this._activated = true;

		let id = this._cursorTracker.connect('cursor-changed', Lang.bind(this, function() {
			this._cursorTracker.set_pointer_visible(false);

			if (!this._activated)
				return;

			this._activated = false;

			GLib.idle_add(GLib.PRIORITY_DEFAULT, Lang.bind(this, function() {
				this._cursorTracker.disconnect(id);
			}));
		}));

		Atspi.generate_mouse_event(x, y, 'b3c');
	}
});


let gestureTapAction;

function enable() {
	gestureTapAction = new GestureTapAction.GestureTapAction(new RightClickAction());
	gestureTapAction.set_n_touch_points(2);
	
	global.stage.add_action(gestureTapAction);
}


function disable() {
	global.stage.remove_action(gestureTapAction);
}


function init() {}
