import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  AlertIOS,
  ScrollView,
  ActivityIndicator,
  ListView
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import Header from '../components/Header';
import { PopButton } from '../components/button';
import {
  submit,
  resetPublish
} from '../actions/message/sendAction';
import {
  fetchPmList,
  resetPmList
} from '../actions/message/pmListAction';
import mainStyles from '../styles/components/_Main';
import indicatorStyles from '../styles/common/_Indicator';
import styles from '../styles/containers/_PmList';

const LOGIN_USER_ID = Symbol();

class PmList extends Component {
  constructor(props) {
    super(props);

    this.userId = this.props.passProps.userId;
  }

  componentDidMount() {
    this.props.fetchPmList({
      userId: this.userId,
      page: 1
    });
  }

  componentWillUnmount() {
    this.props.resetPmList();
  }

  componentWillReceiveProps(nextProps) {
    const { send } = nextProps;
    if (send.response && send.response.rs) {
      this.props.resetPublish();
      this.componentDidMount();
    }
  }

  _loadEarlierMessages(page) {
    this.props.fetchPmList({
      userId: this.userId,
      page
    });
  }

  _onSend({ messages, toUserId }) {
    this.props.submit({
      newMessage: messages[0],
      toUserId
    });
  }

  render() {
    let {
      router,
      pmList: {
        list,
        isRefreshing,
        hasPrev,
        user,
        page
      },
      send
    } = this.props;

    if (isRefreshing && page === 0) {
      return (
        <View style={mainStyles.container}>
          <Header title={user.name}>
            <PopButton router={router} />
          </Header>
          <View style={indicatorStyles.fullScreenIndicator}>
            <ActivityIndicator />
          </View>
        </View>
      );
    }

    let messages = list.map(item => {
      return {
        _id: item.mid,
        text: item.content,
        createdAt: new Date(+item.time),
        user: {
          _id: (item.sender === user.id) && item.sender || LOGIN_USER_ID,
          avatar: (item.sender === user.id) && user.avatar
        }
      };
    });

    return (
      <View style={mainStyles.container}>
        <Header title={user.name}>
          <PopButton router={router} />
        </Header>
        <GiftedChat
          style={mainStyles.container}
          locale={'zh-cn'}
          isLoadingEarlier={isRefreshing && page > 1}
          loadEarlier={hasPrev}
          renderAvatarOnTop={true}
          onLoadEarlier={() => this._loadEarlierMessages(page + 1)}
          onSend={messages => this._onSend({
            messages,
            toUserId: user.id
          })}
          messages={messages}
          user={{ _id: LOGIN_USER_ID }}/>
      </View>
    );
  }
}

function mapStateToProps({ pmList, send }) {
  return {
    pmList,
    send
  };
}

export default connect(mapStateToProps, {
  fetchPmList,
  resetPmList,
  submit,
  resetPublish
})(PmList);