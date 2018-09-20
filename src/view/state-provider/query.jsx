// @flow
import React, { type Node } from 'react';
import type { State } from '../../types';
import type { Dispatch } from '../../state/store-types';
import StateContext, { type Value } from './state-context';

type ListenerProps = {|
  children: (mapProps: mixed, dispatch?: Dispatch) => Node,
  selector: (state: State, ownProps: mixed) => mixed,
  ownProps: mixed,
|};

type QueryProps = {|
  value: Value,
  isParentRender: boolean,
  ...ListenerProps,
|};

type QueryState = {|
  hasMapPropsChanged: boolean,
  mapProps: mixed,
|};

// listening to state updates
// want to render if a parent is rendering

// want to render if: a parent is rendering
// or if the selector returns a new value

class Query extends React.Component<QueryProps, QueryState> {
  state: QueryState = {
    hasMapPropsChanged: false,
    mapProps: this.props.selector(this.props.value.state, this.props.ownProps),
  };

  static getDerivedStateFromProps(props: QueryProps, state: QueryState) {
    const mapProps = props.selector(props.value.state, props.ownProps);
    const hasMapPropsChanged: boolean = mapProps !== state.mapProps;

    return {
      hasMapPropsChanged,
      mapProps,
    };
  }

  shouldComponentUpdate(props: QueryProps, state: QueryState) {
    if (props.isParentRender) {
      return true;
    }

    if (state.hasMapPropsChanged) {
      return true;
    }

    return false;
  }

  render() {
    return this.props.children(this.state.mapProps, this.props.value.dispatch);
  }
}

export default class QueryListener extends React.Component<ListenerProps> {
  isParentRender: boolean = true;

  componentDidUpdate() {
    console.warn('parent render now false');
    this.isParentRender = false;
  }
  render() {
    this.isParentRender = true;
    console.log('QueryListener render');
    return (
      <StateContext.Consumer>
        {(value: Value) => (
          // console.log('what is parent render?', this.isParentRender);
          <Query
            value={value}
            isParentRender={this.isParentRender}
            {...this.props}
          >
            {this.props.children}
          </Query>
        )}
      </StateContext.Consumer>
    );
  }
}