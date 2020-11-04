import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Slider } from "react-semantic-ui-range";
import { Label, Button, Divider } from "semantic-ui-react";

// we need just one action in this component to update settings made
import {updateSettings, fetchIsochrones} from "../actions/actions";

class Settings extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    isochronesControls: PropTypes.object.isRequired
  };

  // dispatches the action
  updateSettings() {
    const { isochronesControls, dispatch } = this.props;
    const settings = isochronesControls.settings;

    dispatch(
      updateSettings({
        settings: settings
      })
    )

    if (settings.isochronesCenter.lat && settings.isochronesCenter.lng) {
      dispatch(fetchIsochrones({ settings }));
    }
  }

  // we are making settings directly in the controls.settings object which is being passed on to the updateSettings() function up top
  handleSettings(settingName, setting) {
    const { isochronesControls } = this.props;

    isochronesControls.settings[settingName] = setting;

    this.updateSettings();
  }

  render() {
    const { isochronesControls } = this.props;

    // our settings which are needed for the range slider, read more here https://github.com/iozbeyli/react-semantic-ui-range
    const rangeSettings = {
      settings: {
        ...isochronesControls.settings.range,
        min: 1,
        step: 1,
        start: isochronesControls.settings.range.value,
        // when the slider is moved, we want to update our settings and make sure the maximums align
        onChange: value => {
          isochronesControls.settings.range.value = value;
          this.updateSettings();
        }
      }
    };

    // we have different kinds of settings in here. The components should be quite self-explanatory. Whenever a button is clicked we call handleSettings() and this way pass on our setting through to our state.
    return (
      <div className="mt3">
        <Divider />
        <Label size="small">{"Travel mode"}</Label>
        <div className="mt3">
          <Button.Group basic size="small">
            {Object.keys({ walking: {}, cycling: {}, driving: {} }).map((key, i) => (
              <Button
                active={key === isochronesControls.settings.mode}
                key={i}
                mode={key}
                onClick={() => this.handleSettings("mode", key)}
              >
                {key}
              </Button>
            ))}
          </Button.Group>
        </div>
        <Divider />
        <Label size="small">{"Range"}</Label>
        <div className="mt3">
          <Slider
            discrete
            color="grey"
            value={isochronesControls.settings.range.value}
            inverted={false}
            settings={rangeSettings.settings}
          />
          <div className="mt2">
            <Label className="mt2" color="grey" size={"mini"}>
              {isochronesControls.settings.range.value}
            </Label>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const isochronesControls = state.isochronesControls;
  return {
    isochronesControls
  };
};

export default connect(mapStateToProps)(Settings);
