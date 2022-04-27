import React, { Component } from 'react'
import axios from 'axios'
import './index.css';

export default class Player extends Component {

    audio = React.createRef();
    seekBar = React.createRef();
    sHover = React.createRef();
    insTime = React.createRef();
    sArea = React.createRef();

    state = {
        imgUrl: '',
        trackUrl: '',
        currAlbum: '',
        currTrackName: '',
        currentTime: '00:00',
        endTime: '00:00',
        active: '',
        status: 'fas fa-play',
        seekLoc: 0,
        seekT: 0,
        musicList: [],
        currIndex: -1,
        colors: { bgColor: '', barColor: '', timeColor: '' }
    }

    selectTrack = (flag) => {
        return () => {
            // 初始currIndex为0,根据flag判断是上一首还是下一首,1为下一首,-1为上一首
            let { currIndex, musicList } = this.state;

            if (flag === 0 || flag === 1) ++currIndex;
            else --currIndex;

            if (currIndex > -1 && currIndex < musicList.length) {
                // 取出musicList里的歌曲对象
                let musicObj = musicList[currIndex];

                if (flag === 0) this.setState({ status: 'fas fa-play' });
                else this.setState({ status: 'fas fa-pause' });

                this.seekBar.current.style.width = 0;
                // setState音乐属性
                this.setState({ ...musicObj }, () => {
                    if (flag !== 0) {
                        this.audio.current.play();
                        this.setState({ active: 'active' });
                    }
                });
            } else {
                if (flag === 0 || flag === 1) --currIndex;
                else ++currIndex;
            }
            this.setState({ currIndex });
        }
    }

    componentDidMount = () => {
        // 异步请求歌曲列表
        axios.get('/test.json').then(
            response => {
                let musicList = response.data.list;
                this.setState({ musicList }, () => {
                    this.selectTrack(0)();
                });
            },
            error => console.log(error)
        )
    }
    showHover = (event) => {
        function getElementLeft(element) {
            var actualLeft = element.offsetLeft;
            var current = element.offsetParent;
            while (current !== null) {
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }
            return actualLeft;
        }
        let seekBarPos = getElementLeft(this.sArea.current);
        let seekT = event.clientX - seekBarPos;
        let seekLoc = this.audio.current.duration * (seekT / this.sArea.current.offsetWidth);
        this.setState({ seekT, seekLoc });

        this.sHover.current.style.width = seekT + 'px';
        let cM = seekLoc / 60;
        let ctMinutes = Math.floor(cM);
        let ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

        if (ctMinutes < 0 || ctSeconds < 0) return;
        if (ctMinutes < 0 || ctSeconds < 0) return;
        if (ctMinutes < 10) ctMinutes = "0" + ctMinutes;
        if (ctSeconds < 10) ctSeconds = "0" + ctSeconds;

        if (isNaN(ctMinutes) || isNaN(ctSeconds)) this.insTime.current.innerText = "--:--";
        else this.insTime.current.innerText = ctMinutes + ":" + ctSeconds;

        this.insTime.current.style.left = seekT + 'px';
        this.insTime.current.style.marginLeft = "-21px";
        this.insTime.current.style.display = "block";
    }
    hideHover = () => {
        this.sHover.current.style.width = 0;
        this.insTime.current.innerText = "00:00";
        this.insTime.current.style.left = 0;
        this.insTime.current.style.marginLeft = 0;
        this.insTime.current.style.display = "none";
    }
    playFromClickedPos = () => {
        this.audio.current.currentTime = this.state.seekLoc;
        this.seekBar.current.style.width = this.state.seekT + 'px';
        this.hideHover();
    }
    updateCurrTime = () => {
        let curMinutes = Math.floor(this.audio.current.currentTime / 60);
        let curSeconds = Math.floor(this.audio.current.currentTime - curMinutes * 60);
        let durMinutes = Math.floor(this.audio.current.duration / 60);
        let durSeconds = Math.floor(this.audio.current.duration - durMinutes * 60);
        let playProgress = (this.audio.current.currentTime / this.audio.current.duration) * 100;

        if (curMinutes < 10) curMinutes = "0" + curMinutes;
        if (curSeconds < 10) curSeconds = "0" + curSeconds;
        if (durMinutes < 10) durMinutes = "0" + durMinutes;
        if (durSeconds < 10) durSeconds = "0" + durSeconds;

        if (isNaN(curMinutes) || isNaN(curSeconds)) this.setState({ currentTime: "00:00" });
        else this.setState({ currentTime: curMinutes + ":" + curSeconds });
        if (isNaN(durMinutes) || isNaN(durSeconds)) this.setState({ endTime: "00:00" });
        else this.setState({ endTime: durMinutes + ":" + durSeconds });
        this.seekBar.current.style.width = playProgress + "%";

        if (playProgress === 100) {
            this.seekBar.current.style.width = 0;
            this.setState({ currentTime: "00:00", active: "", status: "fas fa-play" });
        }
    }
    playPause = () => {
        if (this.audio.current.paused) {
            this.setState({ active: "active", status: "fas fa-pause" });
            this.audio.current.play();
        } else {
            this.setState({ active: "", status: "fas fa-play" });
            this.audio.current.pause();
        }
    }
    render() {
        return (
            <div id="app-cover">
                <div id="bg-artwork" className={this.state.colors.bgColor}>
                    <h1 className='title'>Music Player</h1>
                </div>
                <div id="bg-layer"></div>
                <div id="player">
                    <div id="player-track" className={this.state.active}>
                        <div id="album-name">{this.state.currAlbum}</div>
                        <div id="track-name">{this.state.currTrackName}</div>
                        <div id="track-time" className={this.state.active}>
                            <div id="current-time" className={this.state.colors.timeColor}>{this.state.currentTime}</div>
                            <div id="track-length" className={this.state.colors.timeColor}>{this.state.endTime}</div>
                        </div>
                        <div id="s-area" ref={this.sArea} onMouseMove={this.showHover} onMouseOut={this.hideHover} onClick={this.playFromClickedPos}>
                            <div id="ins-time" ref={this.insTime}></div>
                            <div id="s-hover" ref={this.sHover}></div>
                            <div id="seek-bar" ref={this.seekBar} className={this.state.colors.barColor}></div>
                        </div>
                    </div>
                    <div id="player-content">
                        <div id="album-art" className={this.state.active}>
                            <img src={this.state.imgUrl} className="active" alt="" />
                            <audio src={this.state.trackUrl} ref={this.audio} onTimeUpdate={this.updateCurrTime}></audio>
                        </div>
                        <div id="player-controls">
                            <div className="control">
                                <div className="button" id="play-previous" onClick={this.selectTrack(-1)}>
                                    <i className="fas fa-backward"></i>
                                </div>
                            </div>
                            <div className="control">
                                <div className="button" id="play-pause-button" onClick={this.playPause}>
                                    <i className={this.state.status}></i>
                                </div>
                            </div>
                            <div className="control">
                                <div className="button" id="play-next" onClick={this.selectTrack(1)}>
                                    <i className="fas fa-forward"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}