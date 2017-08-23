/* eslint-disable react/display-name,react/no-multi-comp,complexity,max-statements */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Image,
    View,
    Text,
    StyleSheet,
    ListView,
    Dimensions,
    ActivityIndicator
} from 'react-native';

/* list status change graph
*
*STATUS_NONE->[STATUS_REFRESH_IDLE, STATUS_INFINITE_IDLE, STATUS_INFINITE_LOADED_ALL]
*STATUS_REFRESH_IDLE->[STATUS_NONE, STATUS_WILL_REFRESH]
*STATUS_WILL_REFRESH->[STATUS_REFRESH_IDLE, STATUS_REFRESHING]
*STATUS_REFRESHING->[STATUS_NONE]
*STATUS_INFINITE_IDLE->[STATUS_NONE, STATUS_WILL_INFINITE]
*STATUS_WILL_INFINITE->[STATUS_INFINITE_IDLE, STATUS_INFINITING]
*STATUS_INFINITING->[STATUS_NONE]
*STATUS_INFINITE_LOADED_ALL->[STATUS_NONE]
*
*/
const STATUS_NONE = 0;
const STATUS_REFRESH_IDLE = 1;
const STATUS_WILL_REFRESH = 2;
const STATUS_REFRESHING = 3;
const STATUS_INFINITE_IDLE = 4;
const STATUS_WILL_INFINITE = 5;
const STATUS_INFINITING = 6;
const STATUS_INFINITE_LOADED_ALL = 7;

const DEFAULT_PULL_DISTANCE = 60;
const DEFAULT_HF_HEIGHT = 50;

export default class RIListView extends Component {
  static propTypes = {
    footerHeight: PropTypes.number,
    pullDistance: PropTypes.number,
    renderEmptyRow: PropTypes.func,
    renderRow: PropTypes.func,
    loadedAllData: PropTypes.func,
    renderHeaderRefreshIdle: PropTypes.func,
    renderHeaderWillRefresh: PropTypes.func,
    renderHeaderRefreshing: PropTypes.func,
    renderFooterInifiteIdle: PropTypes.func,
    renderFooterWillInifite: PropTypes.func,
    renderFooterInifiting: PropTypes.func,
    renderFooterInifiteLoadedAll: PropTypes.func,
    onRefresh: PropTypes.func,
    onInfinite: PropTypes.func,
    dataSource: PropTypes.any
  }

  static defaultProps = {
    footerHeight: DEFAULT_HF_HEIGHT,
    pullDistance: DEFAULT_PULL_DISTANCE,
    renderEmptyRow: () => {
      return (
                    <View style={{height: Dimensions.get('window').height * 2 / 3, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 40, fontWeight: '800', color: 'red'}}>
                            have no data
                        </Text>
                    </View>
      );
    },
    renderHeaderRefreshIdle: () => {
      return (
                    <View style={{flex: 1, height: DEFAULT_HF_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.text}>
                        pull down refresh...
                    </Text>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={styles.image}
                        />
                    </View>
      );
    },
    renderHeaderWillRefresh: () => {
      return (
                    <View style={{height: DEFAULT_HF_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.text}>
                        release to refresh...
                    </Text>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={[styles.image, styles.imageRotate]}
                        />
                    </View>
      );
    },
    renderHeaderRefreshing: () => {
      return (
                    <View style={{height: DEFAULT_HF_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.text}>
                        refreshing...
                    </Text>

                        <ActivityIndicator
                            size='small'
                            animating />
                    </View>
      );
    },
    renderFooterInifiteIdle: () => {
      return (
                    <View style={{height: DEFAULT_HF_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={[styles.image, styles.imageRotate]}
                        />
                        <Text style={styles.text}>
                        pull up to load more...
                    </Text>
                    </View>
      );
    },
    renderFooterWillInifite: () => {
      return (
                    <View style={{height: DEFAULT_HF_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={styles.image}
                        />
                        <Text style={styles.text}>
                        release to load more...
                    </Text>
                    </View>
      );
    },
    renderFooterInifiting: () => {
      return (
                    <View style={{height: DEFAULT_HF_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator
                            size='small'
                            animating />
                        <Text style={styles.text}>
                        loading...
                    </Text>
                    </View>
      );
    },
    renderFooterInifiteLoadedAll: () => {
      return (
                    <View style={{height: DEFAULT_HF_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.text}>
                        have loaded all data
                    </Text>
                    </View>
      );
    },
    loadedAllData: () => {
      return false;
    },
    onRefresh: () => {
      setTimeout(function refresh() {
        console.log('onRefresh');
      }, 1000);
    },
    onInfinite: () => {
      setTimeout(function infinite() {
        console.log('onInfinite');
      }, 1000);
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      status: STATUS_NONE,
      isLoadedAllData: false
    };
    this.renderRow = this.renderRow.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderFooter = this.renderFooter.bind(this);
    this.handleResponderGrant = this.handleResponderGrant.bind(this);
    this.handleResponderRelease = this.handleResponderRelease.bind(this);
    this.hideFooter = this.hideFooter.bind(this);
    this.hideHeader = this.hideHeader.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  renderRow(text) {
    if (this.dataSource) {
      return this.props.renderEmptyRow(text);
    } else {
      return this.props.renderRow(text);
    }
  }

  renderHeader() {
    const status = this.state.status;
    if (status === STATUS_REFRESH_IDLE) {
      return this.props.renderHeaderRefreshIdle();
    }
    if (status === STATUS_WILL_REFRESH) {
      return this.props.renderHeaderWillRefresh();
    }
    if (status === STATUS_REFRESHING) {
      return this.props.renderHeaderRefreshing();
    }
    return null;
  }

  renderFooter() {
    const status = this.state.status;
    this.footerIsRender = true;
    if (status === STATUS_INFINITE_IDLE) {
      return this.props.renderFooterInifiteIdle();
    }
    if (status === STATUS_WILL_INFINITE) {
      return this.props.renderFooterWillInifite();
    }
    if (status === STATUS_INFINITING) {
      return this.props.renderFooterInifiting();
    }
    if (status === STATUS_INFINITE_LOADED_ALL) {
      return this.props.renderFooterInifiteLoadedAll();
    }
    this.footerIsRender = false;
    return null;
  }

  handleResponderGrant(event) {
    const nativeEvent = event.nativeEvent;
    if (!nativeEvent.contentInset || this.state.status !== STATUS_NONE) {
      return;
    }
    let y0 = nativeEvent.contentInset.top + nativeEvent.contentOffset.y;
    if (y0 < 0) {
      this.setState({status: STATUS_REFRESH_IDLE});
      return;
    }
    y0 = nativeEvent.contentInset.top + nativeEvent.contentOffset.y +
        nativeEvent.layoutMeasurement.height - nativeEvent.contentSize.height;
    if (y0 > 0) {
      if (!this.props.loadedAllData()) {
        this.initialInfiniteOffset = (y0 > 0 ? y0 : 0);
        this.setState({status: STATUS_INFINITE_IDLE});
      } else {
        this.setState({status: STATUS_INFINITE_LOADED_ALL});
      }
    }
  }

  hideHeader() {
    this.setState({status: STATUS_NONE});
  }

  hideFooter() {
    this.setState({status: STATUS_NONE});
  }

  handleResponderRelease() {
    const status = this.state.status;
    if (status === STATUS_REFRESH_IDLE) {
      this.setState({status: STATUS_NONE});
    } else if (status === STATUS_WILL_REFRESH) {
      this.setState({status: STATUS_REFRESHING});
      this.props.onRefresh();
    } else if (status === STATUS_INFINITE_IDLE) {
      this.setState({status: STATUS_NONE});
    } else if (status === STATUS_WILL_INFINITE) {
      this.setState({status: STATUS_INFINITING});
      this.props.onInfinite();
    } else if (status === STATUS_INFINITE_LOADED_ALL) {
      this.setState({status: STATUS_NONE});
    }
  }

  handleScroll(event) {
    const nativeEvent = event.nativeEvent;
    const status = this.state.status;
    if (status === STATUS_REFRESH_IDLE || status === STATUS_WILL_REFRESH) {
      const y = nativeEvent.contentInset.top + nativeEvent.contentOffset.y;
      if (status !== STATUS_WILL_REFRESH && y < -this.props.pullDistance) {
        this.setState({status: STATUS_WILL_REFRESH});
      } else if (status === STATUS_WILL_REFRESH && y >= -this.props.pullDistance) {
        this.setState({status: STATUS_REFRESH_IDLE});
      }
      return;
    }

    if (status === STATUS_INFINITE_IDLE || status === STATUS_WILL_INFINITE) {
      let y = nativeEvent.contentInset.top + nativeEvent.contentOffset.y + nativeEvent.layoutMeasurement.height -
            nativeEvent.contentSize.height - this.initialInfiniteOffset;
      if (this.footerIsRender) {
        y += this.props.footerHeight;
      }
      if (status !== STATUS_WILL_INFINITE && y > this.props.pullDistance) {
        this.setState({status: STATUS_WILL_INFINITE});
      } else if (status === STATUS_WILL_INFINITE && y <= this.props.pullDistance) {
        this.setState({status: STATUS_INFINITE_IDLE});
      }
    }
  }

  render() {
    this.dataSource = null;
    if (!this.props.dataSource.getRowCount()) {
      const DataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.dataSource = DataSource.cloneWithRows(['']);
    }
    return (
            <ListView
                {...this.props}
                dataSource={this.dataSource ? this.dataSource : this.props.dataSource}
                renderRow={this.renderRow}
                renderHeader={this.renderHeader}
                renderFooter={this.renderFooter}
                onResponderGrant={this.handleResponderGrant}
                onResponderRelease={this.handleResponderRelease}
                onScroll={this.handleScroll}
                />
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16
  },
  image: {
    width: 40,
    height: 32
  },
  imageRotate: {
    transform: [{rotateX: '180deg'}]
  }
});
