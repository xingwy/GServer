"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const FIXED_BUFFER = 4 + 8 + 8 + 4 + 1;
function setFixedData(from, opcode, flag, content) {
    let unique = 1;
    let size = content && content.length || 0;
    let buffer = Buffer.allocUnsafe(FIXED_BUFFER + size);
    let offset = 0;
    buffer.writeUInt32LE((buffer.byteLength), offset);
    offset += 4;
    buffer.writeDoubleLE(from, offset);
    offset += 8;
    buffer.writeDoubleLE(unique, offset);
    offset += 8;
    buffer.writeInt32LE(opcode, offset);
    offset += 4;
    buffer.writeUInt8(flag, offset);
    offset += 1;
    if (content) {
        content.copy(buffer, offset);
    }
    return buffer;
}
function buildFixedData(content) {
    let offset = 0;
    let size = content.readUInt32LE(offset);
    offset += 4;
    // if (size !== content.length) {
    //     // 校验数据长度
    //     console.log("消息长度不足");
    //     throw(new Error("消息长度不足"));
    // }
    let from = content.readDoubleLE(offset);
    offset += 8;
    let to = content.readDoubleLE(offset);
    offset += 8;
    let opcode = content.readUInt32LE(offset);
    offset += 4;
    let flag = content.readUInt8(offset);
    offset += 1;
    let tuple = content.slice(offset);
    return [size, from, to, opcode, flag, tuple];
}
async function main() {
    let session = new WebSocket(`ws://127.0.0.1:10002`);
    session.onopen = (s) => {
        // console.log(s);
    };
    session.onerror = (error) => {
        console.log(error);
    };
    session.onmessage = (data) => {
        // console.log();
    };
    session.onclose = () => {
        console.log("close");
    };
    let content = Buffer.from("hello");
    let buffer = setFixedData(1111, 2222, 1, content);
    console.log(buffer);
    console.log(buildFixedData(buffer));
    setInterval(() => {
        session.send(buffer);
    }, 5000);
}
main();
//# sourceMappingURL=client.js.map