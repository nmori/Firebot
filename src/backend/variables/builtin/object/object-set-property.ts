import type { ReplaceVariable, Trigger } from "../../../../types/variables";
import logger from '../../../logwrapper';

const model : ReplaceVariable = {
    definition: {
        handle: "setObjectProperty",
        description: "指定した JSON オブジェクトのプロパティを追加・更新します。ネストされたプロパティにはドット記法（例: some.property）を使用できます。value に null を指定するとプロパティを削除します。",
        usage: "setObjectProperty[object, propertyPath, value]",
        examples: [
            {
                usage: `setObjectProperty[{"name": "John"}, age, 25]`,
                description: `age プロパティを 25 に追加・更新します。結果: {"name": "John", "age": 25}`
            },
            {
                usage: `setObjectProperty[{"user": {"name": "John"}}, user.age, 25]`,
                description: `ドット記法でネストされたプロパティを追加・更新します。結果: {"user": {"name": "John", "age": 25}}`
            },
            {
                usage: `setObjectProperty[{"name": "John", "age": 25}, age, null]`,
                description: `age プロパティを削除します。結果: {"name": "John"}`
            }
        ],
        categories: ["advanced"],
        possibleDataOutput: ["text"]
    },
    evaluator: (
        trigger: Trigger,
        subject: unknown,
        propertyPath: string | Array<string | number>,
        value: unknown
    ) : unknown => {

        if (typeof subject === 'string' || subject instanceof String) {
            try {
                subject = JSON.parse(`${subject.toString()}`);
            } catch {
                logger.error("Invalid object specified", subject);
                return null;
            }
        }

        if (subject == null || typeof subject !== 'object') {
            logger.error(`$getObjectProperty[]: subject must be an object or array`);
            return null;
        }

        let nodes : Array<string | number>;
        if (typeof propertyPath === 'string' || propertyPath instanceof String) {
            nodes = propertyPath
                .split(/\./g)
                .map((node) => {
                    if (Number.isFinite(Number(node))) {
                        return Number(node);
                    }
                    return node;
                });

        } else if (propertyPath == null || !Array.isArray(propertyPath) || propertyPath.length < 1) {
            logger.error("Property path must be specified");
            return null;

        } else {
            nodes = propertyPath;
        }

        // walk subject
        let currentSubject: unknown = subject,
            key : string | number = nodes.shift();
        do {
            if (currentSubject == null || typeof currentSubject !== 'object') {
                logger.error(`$getObjectProperty[]: walked path leads to invalid`);
                return null;
            }
            if (nodes.length > 0) {
                currentSubject = currentSubject[key];
                key = nodes.shift();
            }
        } while (nodes.length);

        if (value == null) {
            if (Array.isArray(currentSubject)) {
                currentSubject.splice(<number>key, 1);
            } else {
                delete currentSubject[key];
            }
        } else {
            currentSubject[key] = value;
        }

        return subject;
    }
};

export default model;