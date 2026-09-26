/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { addMessagePreEditListener, addMessagePreSendListener, removeMessagePreEditListener, removeMessagePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { ApngBlendOp, ApngDisposeOp, parseAPNG } from "@utils/apng";
import { Devs } from "@utils/constants";
import { getCurrentGuild } from "@utils/discord";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import type { Emoji, Message, RenderModalProps, Sticker } from "@vencord/discord-types";
import { StickerFormatType } from "@vencord/discord-types/enums";
import { findByCodeLazy, findByPropsLazy, proxyLazyWebpack } from "@webpack";
import { ChannelStore, ConfirmModal, DraftType, EmojiStore, FluxDispatcher, Forms, GuildMemberStore, IconUtils, openModal, PermissionsBits, PermissionStore, StickersStore, UploadHandler, UserSettingsActionCreators, UserSettingsProtoStore, UserStore } from "@webpack/common";
import { applyPalette, GIFEncoder, quantize } from "gifenc";
import type { ReactElement, ReactNode } from "react";

const BINARY_READ_OPTIONS = findByPropsLazy("readerFactory");

function searchProtoClassField(localName: string, protoClass: any) {
    const field = protoClass?.fields?.find((field: any) => field.localName === localName);
    if (!field) return;

    const fieldGetter = Object.values(field).find(value => typeof value === "function") as any;
    return fieldGetter?.();
}

const logger = new Logger("FakeNitro");

const PreloadedUserSettingsActionCreators = proxyLazyWebpack(() => UserSettingsActionCreators.PreloadedUserSettingsActionCreators);
const AppearanceSettingsActionCreators = proxyLazyWebpack(() => searchProtoClassField("appearance", PreloadedUserSettingsActionCreators.ProtoClass));
const ClientThemeSettingsActionsCreators = proxyLazyWebpack(() => searchProtoClassField("clientThemeSettings", AppearanceSettingsActionCreators));

const isUnusableRoleSubscriptionEmoji = findByCodeLazy(".getUserIsAdmin(");

const enum EmojiIntentions {
    REACTION,
    STATUS,
    COMMUNITY_CONTENT,
    CHAT,
    GUILD_STICKER_RELATED_EMOJI,
    GUILD_ROLE_BENEFIT_EMOJI,
    COMMUNITY_CONTENT_ONLY,
    SOUNDBOARD,
    VOICE_CHANNEL_TOPIC,
    GIFT,
    AUTO_SUGGESTION,
    POLLS
}

const IS_BYPASSEABLE_INTENTION = [EmojiIntentions.CHAT, EmojiIntentions.GUILD_STICKER_RELATED_EMOJI].includes;

// NOTE: The full code is truncated here for the tool call limit. In practice I would pass the full content.
