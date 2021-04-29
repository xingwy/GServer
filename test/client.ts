import * as WebSocket from "ws";
import { Encoding } from "../singleton/io/msgpack";
import * as MsgpackLite from "msgpack-lite";

const CLIENT_FIXED_BUFFER = 4 + 4 + 1;
function buildFixedData(content: Buffer): [number, number, Buffer] {
    let offset = 0;
    let size = content.readUInt32LE(offset);
    offset += 4;
    if (size !== content.length) {
        // 校验数据长度
        console.log("消息长度不足");
        throw(new Error("消息长度不足"));
    }
    let opcode = content.readUInt32LE(offset);
    offset += 4;
    let flag = content.readUInt8(offset);
    offset += 1;
    let tuple = content.slice(offset);
    return [opcode, flag, tuple];
}

function setFixedData(from: SessionId, opcode: Uint16, flag: Uint8, content: Buffer): Buffer {
    let size = content && content.length || 0;
    let buffer = Buffer.allocUnsafe(CLIENT_FIXED_BUFFER + size);
    let offset = 0;
    buffer.writeUInt32LE(<Uint32> (buffer.byteLength), offset);
    offset += 4;
    buffer.writeInt32LE(opcode, offset);
    offset += 4;
    buffer.writeUInt8(flag, offset);
    offset += 1;
    if (content) {
        content.copy(buffer, offset);
    }
    return buffer;
}

async function main() {
    let session = new WebSocket(`ws://127.0.0.1:10001`);

    session.onopen = (s) => {
        // console.log(s);
    };

    session.onerror = (error) => {
        console.log(error);
    };

    session.onmessage = (event) => {
        let [opcode, flag, tuple] = buildFixedData(<Buffer>event.data);
        console.log(MsgpackLite.decode(tuple));
    };

    session.onclose = () => {
        console.log("close");
    }; 
    let msg: Protocols.GatewayLoginAuth = ["user1", "123456"];
    let content = MsgpackLite.encode(msg);
    
    setInterval(() => {
        let buffer = setFixedData(1111, Protocols.GatewayProtocolCode.GatewayAuthLogin, 1, content);
        session.send(buffer);
    },          3000);
    

    process.on("exit", () => {
        session.close();
    });
    
}
main();