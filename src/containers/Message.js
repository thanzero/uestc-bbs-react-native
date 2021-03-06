import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import mainStyles from '../styles/components/_Main';
import scrollableTabViewStyles from '../styles/common/_ScrollableTabView';
import colors from '../styles/common/_colors';
import Header from '../components/Header';
import NotifyList from '../components/NotifyList';
import ReplyModal from '../components/modal/ReplyModal';
import { invalidateNotifyList, fetchNotifyList } from '../actions/message/notifyListAction';
import { submit } from '../actions/topic/publishAction';
import { resetReply } from '../actions/topic/replyAction';

const TABS = [
  { label: '@', type: 'at' },
  { label: '回复', type: 'post' }
];

class Message extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isReplyModalOpen: false,
      currentNotification: null
    };
  }

  _fetchNotifyList(notifyType) {
    this.props.fetchNotifyList({ notifyType });
  }

  _refreshNotifyList({ page, isEndReached, notifyType }) {
    this.props.invalidateNotifyList({ notifyType });
    this.props.fetchNotifyList({
      notifyType,
      isEndReached,
      page
    });
  }

  _publish({ boardId, topicId, replyId, images, content }) {
    this.props.submit({
      boardId,
      topicId,
      replyId,
      typeId: null,
      title: null,
      images,
      content
    });
  }

  toggleReplyModal(visible, notification) {
    this.setState({
      isReplyModalOpen: visible,
      currentNotification: notification
    });
  }

  render() {
    let {
      notifyList,
      reply,
      router
    } = this.props;
    let { isReplyModalOpen, currentNotification } = this.state;

    return (
      <View style={mainStyles.container}>
        {isReplyModalOpen &&
          <ReplyModal
            visible={isReplyModalOpen}
            content={currentNotification}
            reply={reply}
            resetReply={() => this.props.resetReply()}
            closeReplyModal={() => this.toggleReplyModal(false)}
            handlePublish={comment => this._publish(comment)} />
        }
        <Header title='消息'
                updateMenuState={isOpen => this.props.updateMenuState(isOpen)} />
        <ScrollableTabView
          tabBarBackgroundColor={colors.lightBlue}
          tabBarActiveTextColor={colors.white}
          tabBarInactiveTextColor={colors.white}
          tabBarUnderlineStyle={scrollableTabViewStyles.tabBarUnderline}
          tabBarTextStyle={scrollableTabViewStyles.tabBarText}>
          {TABS.map((tab, index) => {
            return (
              <NotifyList
                key={index}
                tabLabel={tab.label}
                notifyList={_.get(notifyList, tab.type, {})}
                router={router}
                fetchNotifyList={() => this._fetchNotifyList(tab.type)}
                refreshNotifyList={({ page, isEndReached }) => this._refreshNotifyList({ page, isEndReached, notifyType: tab.type })}
                openReplyModal={notification => this.toggleReplyModal(true, notification)} />
            );
          })}
        </ScrollableTabView>
      </View>
    );
  }
}

function mapStateToProps({ notifyList, reply }) {
  return {
    notifyList,
    reply
  };
}

export default connect(mapStateToProps, {
  invalidateNotifyList,
  fetchNotifyList,
  submit,
  resetReply
})(Message);
