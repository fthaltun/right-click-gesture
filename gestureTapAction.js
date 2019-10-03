const Lang = imports.lang;

const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;


const GestureTapAction = new Lang.Class({
	Name: 'GestureTapAction',
	Extends: Clutter.TapAction,

	_init: function(gesture) {
		this.parent();

		this._gesture = gesture;
		this._cursorTracker = Meta.CursorTracker.get_for_display(global.display);

		this._gesture.connect('gesture-begin', Lang.bind(this, function() {
			return !this._cursorTracker.disconnect(this._cursorChangedId);
		}));

		this._gesture.connect('gesture-cancel', Lang.bind(this, function() {
			if (!this._activated)
				return;

			this._activated = false;

			global.stage.remove_action(this._gesture);
		}));
	},

	vfunc_gesture_prepare: function() {
		return !this._activated && this.get_n_current_points() == this.get_n_touch_points();
	},

	vfunc_gesture_end: function() {
		this._activated = true;

		global.stage.add_action(this._gesture);

		this._cursorChangedId = this._cursorTracker.connect('cursor-changed', Lang.bind(this, function() {
			if (!this._activated)
				return;

			this._activated = false;

			this._cursorTracker.disconnect(this._cursorChangedId);
			global.stage.remove_action(this._gesture);
		}));
	}
});
