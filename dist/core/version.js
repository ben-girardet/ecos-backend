"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersion = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let _version;
const version = '1.0.1';
function getVersion() {
    if (_version) {
        return _version;
    }
    const rev = fs_1.default.readFileSync(path_1.default.join(__dirname, '../../../.git/HEAD')).toString();
    const origHash = fs_1.default.readFileSync(path_1.default.join(__dirname, '../../../.git/ORIG_HEAD')).toString().trim();
    let hash = '';
    let branch = '';
    if (rev.indexOf(':') === -1) {
        hash = rev.trim();
    }
    else {
        branch = rev.substring(5).trim();
        try {
            hash = fs_1.default.readFileSync(path_1.default.join(__dirname, '../../../.git/' + branch)).toString().trim();
        }
        catch (error) {
            // do nothing
        }
    }
    _version = {
        branch,
        hash,
        origHash,
        v: version
    };
    return _version;
}
exports.getVersion = getVersion;
