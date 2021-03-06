import { push } from '@mraerino/redux-little-router-reactless';
import { call, put, select, takeLatest } from 'redux-saga/effects';

import { Types } from '../actions';
import {
    createNewParty,
    createPartyFail,
    joinPartyFail,
    resolveShortId,
    JoinPartyStartAction,
} from '../actions/party-data';
import { PartySettings, State } from '../state';

function* createParty() {
    const { player, user }: State = yield select();
    const spotifyUser = user.spotify.user;

    if (!spotifyUser) {
        const e = new Error("Missing Spotify user");
        yield put(createPartyFail(e));
        return;
    }

    const userDisplayName = spotifyUser.display_name || spotifyUser.id;
    let partyId: string;
    try {
        partyId = yield call(
            createNewParty,
            userDisplayName,
            player.instanceId,
            spotifyUser.country,
            PartySettings.defaultSettings(),
        );
    } catch (err) {
        yield put(createPartyFail(err));
        return;
    }

    yield put(push(`/party/${partyId}`));
}

function* joinParty(ac: JoinPartyStartAction) {
    const { homeView }: State = yield select();

    if (!homeView.partyIdValid) {
        const e = new Error("Party ID is invalid!");
        yield put(joinPartyFail(e));
        return;
    }

    const longId = yield call(resolveShortId, homeView.partyId);

    if (!longId) {
        const e = new Error("Party not found!");
        yield put(joinPartyFail(e));
        return;
    }

    yield put(push(`/party/${longId}`));
}

export default function*() {
    yield takeLatest(Types.CREATE_PARTY_Start, createParty);
    yield takeLatest(Types.JOIN_PARTY_Start, joinParty);
}
